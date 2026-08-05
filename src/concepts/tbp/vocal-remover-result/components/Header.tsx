import logoUrl from '../assets/logo-thebestpdf.svg';

/** Product header — TheBestPDF logotype. Desktop 80px / mobile 60px. Static
 * here; the real app renders its shared <Header/> around the result page. */
export default function Header() {
  return (
    <header data-ff="header" className="flex h-[60px] items-center px-4 md:h-20 md:px-[148px]">
      <img src={logoUrl} alt="TheBestPDF" className="h-[30px] w-auto" />
    </header>
  );
}
