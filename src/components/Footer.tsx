export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 w-full bg-[var(--color-bg)] border-t-2 border-[var(--color-red)] h-12 flex items-center justify-center z-50 shadow-[0_-2px_24px_#ff1744]">
      <span className="text-gray-400 text-center w-full" style={{textShadow: '0 0 8px #fff2'}}>© {new Date().getFullYear()}</span>
    </footer>
  );
}