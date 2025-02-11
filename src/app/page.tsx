export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4">
      <h1 className="text-5xl font-extrabold drop-shadow-lg animate-fade-in">
        Welcome to <span className="text-yellow-300">Glowante</span> ✨
      </h1>
      <p className="text-lg text-gray-200 mt-3 text-center max-w-lg">
        Discover the best beauty salons and book your favorite services with ease.
      </p>
      <p className="text-lg text-gray-200 mt-3 text-center max-w-lg">
        Book Local Beauty and Wellness Services.
      </p>
      <a 
        href="https://glowante.com/"
        target="_blank" 
        rel="noopener noreferrer"
        className="mt-6 px-6 py-3 bg-yellow-400 text-gray-900 font-bold rounded-full shadow-lg hover:bg-yellow-500 transition-all duration-300"
      >
        Visit Glowante 🚀
      </a>
    </div>
  );
}