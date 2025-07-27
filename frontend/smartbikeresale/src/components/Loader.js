'use client';

const Loader = ({ size = '8', color = 'indigo-600' }) => {
  return (
    <div className="flex justify-center items-center py-12">
      <div
        className={`animate-spin rounded-full h-${size} w-${size} border-t-2 border-b-2 border-${color}`}
      ></div>
    </div>
  );
};

export default Loader;
