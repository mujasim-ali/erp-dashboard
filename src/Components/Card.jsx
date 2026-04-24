const Card = ({ title, value }) => {
  return (
    <div
      className="
        bg-white 
        p-4 sm:p-5 
        rounded-xl 
        shadow 
        flex flex-col justify-between
        transition-all duration-200
        hover:shadow-lg
      "
    >
      <p className="text-gray-500 text-sm sm:text-base">{title}</p>

      <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mt-2">
        {value}
      </h2>
    </div>
  );
};

export default Card;
