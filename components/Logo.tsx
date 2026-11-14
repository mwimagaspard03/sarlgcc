// shortcut: logo en texte SVG, remplacer par le fichier du logo définitif quand il existe
export default function Logo() {
  return (
    <svg className="logo" viewBox="0 0 150 36" role="img" aria-label="GCC Sarl">
      <text x="0" y="26" className="logo-main">GCC</text>
      <line x1="76" y1="18" x2="92" y2="18" className="logo-line" />
      <text x="98" y="23" className="logo-sub">Sarl</text>
    </svg>
  );
}
