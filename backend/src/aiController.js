const { db } = require("../db/database");
const { v4: uuidv4 } = require("uuid");

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-20250514";

async function callClaude(messages, systemPrompt, maxTokens = 1000) {
  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Anthropic API error: ${response.status} - ${err}`);
  }

  const data = await response.json();
  return data.content[0]?.text || "";
}

// ─── AI Project Assistant Chat ─────────────────────────────────────────────
const projectChat = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { message } = req.body;

    if (!message?.trim()) return res.status(400).json({ error: "Message is required" });

    // Gather project context
    const [projectRes, tasksRes, membersRes, logsRes] = await Promise.all([
      db.execute({ sql: "SELECT * FROM projects WHERE project_id = ?", args: [projectId] }),
      db.execute({
        sql: `SELECT t.title, t.status, t.priority, t.due_date, u.name as assignee
              FROM tasks t LEFT JOIN users u ON u.user_id = t.assigned_to
              WHERE t.project_id = ? ORDER BY t.created_at DESC LIMIT 50`,
        args: [projectId],
      }),
      db.execute({
        sql: `SELECT u.name, u.email, pm.role FROM project_members pm
              JOIN users u ON u.user_id = pm.user_id WHERE pm.project_id = ?`,
        args: [projectId],
      }),
      db.execute({
        sql: `SELECT action, details, created_at FROM activity_log
              WHERE project_id = ? ORDER BY created_at DESC LIMIT 20`,
        args: [projectId],
      }),
    ]);

    if (projectRes.rows.length === 0) return res.status(404).json({ error: "Project not found" });

    const project = projectRes.rows[0];
    const tasks = tasksRes.rows;
    const members = membersRes.rows;

    const taskSummary = {
      total: tasks.length,
      todo: tasks.filter(t => t.status === "todo").length,
      in_progress: tasks.filter(t => t.status === "in_progress").length,
      review: tasks.filter(t => t.status === "review").length,
      done: tasks.filter(t => t.status === "done").length,
      high_priority: tasks.filter(t => t.priority === "high" || t.priority === "critical").length,
    };

    const systemPrompt = `You are an intelligent ERP project assistant for the project "${project.project_name}".

PROJECT CONTEXT:
- Name: ${project.project_name}
- Description: ${project.description || "No description"}
- Created: ${project.created_at}

TEAM (${members.length} members):
${members.map(m => `- ${m.name} (${m.email}) - ${m.role}`).join("\n")}

TASK OVERVIEW:
- Total: ${taskSummary.total} | Todo: ${taskSummary.todo} | In Progress: ${taskSummary.in_progress} | Review: ${taskSummary.review} | Done: ${taskSummary.done}
- High/Critical priority tasks: ${taskSummary.high_priority}

RECENT TASKS:
${tasks.slice(0, 10).map(t => `- [${t.status}] ${t.title} (${t.priority}) ${t.assignee ? `→ ${t.assignee}` : "unassigned"}`).join("\n")}

You can help with: project status summaries, task prioritization, workload analysis, deadline tracking, team collaboration suggestions, and general project management advice. Be concise, specific, and actionable. Use the actual project data in your responses.`;

    // Load chat history
    const historyRes = await db.execute({
      sql: `SELECT role, content FROM ai_chat_history
            WHERE user_id = ? AND project_id = ? ORDER BY created_at DESC LIMIT 20`,
      args: [req.user.user_id, projectId],
    });

    const history = historyRes.rows.reverse().map(r => ({ role: r.role, content: r.content }));
    const messages = [...history, { role: "user", content: message }];

    const reply = await callClaude(messages, systemPrompt, 800);

    // Save conversation
    await db.execute({
      sql: `INSERT INTO ai_chat_history (id, user_id, project_id, role, content) VALUES (?, ?, ?, 'user', ?)`,
      args: [uuidv4(), req.user.user_id, projectId, message],
    });
    await db.execute({
      sql: `INSERT INTO ai_chat_history (id, user_id, project_id, role, content) VALUES (?, ?, ?, 'assistant', ?)`,
      args: [uuidv4(), req.user.user_id, projectId, reply],
    });

    res.json({ reply, context: { task_summary: taskSummary } });
  } catch (err) {
    console.error("AI chat error:", err);
    res.status(500).json({ error: "AI assistant unavailable: " + err.message });
  }
};

// ─── Task Suggestions ──────────────────────────────────────────────────────
const suggestTasks = async (req, res) => {
  try {
    const { projectId } = req.params;

    const [projectRes, existingTasksRes] = await Promise.all([
      db.execute({ sql: "SELECT * FROM projects WHERE project_id = ?", args: [projectId] }),
      db.execute({
        sql: "SELECT title, status FROM tasks WHERE project_id = ? ORDER BY created_at DESC LIMIT 30",
        args: [projectId],
      }),
    ]);

    if (projectRes.rows.length === 0) return res.status(404).json({ error: "Project not found" });

    const project = projectRes.rows[0];
    const existingTasks = existingTasksRes.rows;

    const prompt = `You are a project management expert. Based on the project details and existing tasks, suggest 5-8 new tasks that would help advance this project.

Project: "${project.project_name}"
Description: "${project.description || "N/A"}"

Existing tasks:
${existingTasks.map(t => `- [${t.status}] ${t.title}`).join("\n") || "None yet"}

Return ONLY a JSON array (no markdown, no explanation) with objects having these fields:
- title: string (short, actionable task title)
- description: string (1-2 sentence description)  
- priority: "low" | "medium" | "high"
- estimated_hours: number`;

    const reply = await callClaude(
      [{ role: "user", content: prompt }],
      "You are a project management expert. Always respond with valid JSON only, no markdown formatting.",
      1000
    );

    let suggestions;
    try {
      const cleaned = reply.replace(/```json|```/g, "").trim();
      suggestions = JSON.parse(cleaned);
    } catch {
      suggestions = [];
    }

    res.json({ suggestions });
  } catch (err) {
    console.error("Task suggestion error:", err);
    res.status(500).json({ error: "Failed to generate task suggestions" });
  }
};

// ─── Project Summary / Status Report ──────────────────────────────────────
const generateProjectSummary = async (req, res) => {
  try {
    const { projectId } = req.params;

    const [projectRes, tasksRes, membersRes] = await Promise.all([
      db.execute({ sql: "SELECT * FROM projects WHERE project_id = ?", args: [projectId] }),
      db.execute({
        sql: `SELECT t.title, t.status, t.priority, t.due_date, u.name as assignee
              FROM tasks t LEFT JOIN users u ON u.user_id = t.assigned_to
              WHERE t.project_id = ?`,
        args: [projectId],
      }),
      db.execute({
        sql: `SELECT u.name, pm.role, COUNT(t.task_id) as task_count
              FROM project_members pm
              JOIN users u ON u.user_id = pm.user_id
              LEFT JOIN tasks t ON t.assigned_to = pm.user_id AND t.project_id = pm.project_id
              WHERE pm.project_id = ? GROUP BY pm.user_id`,
        args: [projectId],
      }),
    ]);

    if (projectRes.rows.length === 0) return res.status(404).json({ error: "Project not found" });

    const project = projectRes.rows[0];
    const tasks = tasksRes.rows;
    const members = membersRes.rows;

    const overdueTasks = tasks.filter(t =>
      t.due_date && new Date(t.due_date) < new Date() && t.status !== "done"
    );

    const prompt = `Generate a concise executive project status report for:

Project: "${project.project_name}"
Description: ${project.description || "N/A"}
Created: ${project.created_at}

Task Stats:
- Total: ${tasks.length}
- Todo: ${tasks.filter(t => t.status === "todo").length}
- In Progress: ${tasks.filter(t => t.status === "in_progress").length}
- Review: ${tasks.filter(t => t.status === "review").length}
- Done: ${tasks.filter(t => t.status === "done").length}
- Overdue: ${overdueTasks.length}
- High/Critical: ${tasks.filter(t => t.priority === "high" || t.priority === "critical").length}

Team Workload:
${members.map(m => `- ${m.name}: ${m.task_count} tasks`).join("\n")}

Overdue tasks: ${overdueTasks.map(t => t.title).join(", ") || "None"}

Write a professional 3-4 paragraph status report including: overall health, progress highlights, risks/blockers, and recommended next steps. Be specific and actionable.`;

    const summary = await callClaude(
      [{ role: "user", content: prompt }],
      "You are a senior project manager writing concise executive status reports.",
      1000
    );

    res.json({ summary, generated_at: new Date().toISOString(), project_name: project.project_name });
  } catch (err) {
    console.error("Summary error:", err);
    res.status(500).json({ error: "Failed to generate summary" });
  }
};

// ─── Smart Task Description Generator ─────────────────────────────────────
const generateTaskDescription = async (req, res) => {
  try {
    const { title, context } = req.body;
    if (!title) return res.status(400).json({ error: "Task title is required" });

    const prompt = `Write a clear, actionable task description for the following task title in an ERP/project management system.

Task title: "${title}"
${context ? `Project context: ${context}` : ""}

Provide:
1. A 2-3 sentence description of what needs to be done
2. 3-5 clear acceptance criteria (what "done" looks like)

Format as JSON: { "description": "...", "acceptance_criteria": ["...", "..."] }`;

    const reply = await callClaude(
      [{ role: "user", content: prompt }],
      "You are a technical project manager. Respond with valid JSON only.",
      600
    );

    let result;
    try {
      const cleaned = reply.replace(/```json|```/g, "").trim();
      result = JSON.parse(cleaned);
    } catch {
      result = { description: reply, acceptance_criteria: [] };
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to generate description" });
  }
};

// ─── Workload Analysis ─────────────────────────────────────────────────────
const analyzeWorkload = async (req, res) => {
  try {
    const { projectId } = req.params;

    const membersRes = await db.execute({
      sql: `SELECT u.user_id, u.name, u.email,
              COUNT(t.task_id) as total_tasks,
              SUM(CASE WHEN t.status = 'in_progress' THEN 1 ELSE 0 END) as active_tasks,
              SUM(CASE WHEN t.status = 'done' THEN 1 ELSE 0 END) as done_tasks,
              SUM(CASE WHEN t.priority IN ('high','critical') THEN 1 ELSE 0 END) as high_priority_tasks,
              SUM(CASE WHEN t.due_date < date('now') AND t.status != 'done' THEN 1 ELSE 0 END) as overdue_tasks
            FROM project_members pm
            JOIN users u ON u.user_id = pm.user_id
            LEFT JOIN tasks t ON t.assigned_to = u.user_id AND t.project_id = pm.project_id
            WHERE pm.project_id = ?
            GROUP BY u.user_id`,
      args: [projectId],
    });

    const prompt = `Analyze this team workload and provide recommendations:

${JSON.stringify(membersRes.rows, null, 2)}

Return JSON: { "analysis": "2-3 sentence summary", "recommendations": ["...", "..."], "overloaded": ["user names"], "underutilized": ["user names"] }`;

    const reply = await callClaude(
      [{ role: "user", content: prompt }],
      "You are a team lead analyzing workload. Respond with valid JSON only.",
      600
    );

    let aiAnalysis;
    try {
      const cleaned = reply.replace(/```json|```/g, "").trim();
      aiAnalysis = JSON.parse(cleaned);
    } catch {
      aiAnalysis = { analysis: reply, recommendations: [] };
    }

    res.json({ members: membersRes.rows, ai_analysis: aiAnalysis });
  } catch (err) {
    res.status(500).json({ error: "Failed to analyze workload" });
  }
};

// ─── Clear chat history ────────────────────────────────────────────────────
const clearChatHistory = async (req, res) => {
  try {
    const { projectId } = req.params;
    await db.execute({
      sql: "DELETE FROM ai_chat_history WHERE user_id = ? AND project_id = ?",
      args: [req.user.user_id, projectId],
    });
    res.json({ message: "Chat history cleared" });
  } catch (err) {
    res.status(500).json({ error: "Failed to clear history" });
  }
};

const getChatHistory = async (req, res) => {
  try {
    const { projectId } = req.params;
    const result = await db.execute({
      sql: `SELECT id, role, content, created_at FROM ai_chat_history
            WHERE user_id = ? AND project_id = ? ORDER BY created_at ASC LIMIT 50`,
      args: [req.user.user_id, projectId],
    });
    res.json({ history: result.rows });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
};

module.exports = {
  projectChat, suggestTasks, generateProjectSummary,
  generateTaskDescription, analyzeWorkload,
  clearChatHistory, getChatHistory,
};
