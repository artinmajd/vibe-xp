export default function DarkBackground() {
  return (
    <>
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="blob-1 absolute top-[10%] left-[15%] w-[280px] h-[280px] rounded-full bg-indigo-500/60 blur-[8px]" />
        <div className="blob-2 absolute top-[30%] right-[10%] w-[340px] h-[340px] rounded-full bg-violet-600/55 blur-[10px]" />
        <div className="blob-3 absolute bottom-[10%] left-[25%] w-[260px] h-[260px] rounded-full bg-blue-500/55 blur-[8px]" />
        <div className="blob-4 absolute top-[60%] right-[30%] w-[160px] h-[160px] rounded-full bg-purple-400/65 blur-[6px]" />
        <div className="blob-5 absolute top-[5%] right-[40%] w-[130px] h-[130px] rounded-full bg-sky-400/55 blur-[6px]" />
        <div className="blob-6 absolute bottom-[25%] right-[5%] w-[180px] h-[180px] rounded-full bg-fuchsia-500/60 blur-[8px]" />
      </div>
      <div className="pointer-events-none fixed inset-0 z-0 backdrop-blur-[2px]" />
    </>
  );
}
