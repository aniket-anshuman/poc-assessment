export const ArticleToolbar: React.FC = () => {
    return (
      <nav className="flex gap-10 px-8 py-3.5 text-sm font-semibold tracking-normal text-white bg-sky-700 rounded-none border border-solid border-neutral-200 max-md:px-5 max-md:max-w-full">
        <button className="grow shrink w-[102px]">Article Manager</button>
        <button className="grow shrink w-[108px]">Article Navigator</button>
        <button className="grow shrink w-[105px]">Download HTML</button>
        <button className="font-bold text-yellow-400">SAVE</button>
      </nav>
    );
  };
  