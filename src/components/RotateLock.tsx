/**
 * Overlay HQ que aparece quando o smartphone está em paisagem.
 * O bloqueio é 100% CSS (media query em styles.css) — este componente
 * só entrega o markup. Em desktop e tablets grandes fica sempre oculto.
 */
export function RotateLock() {
  return (
    <div className="rotate-lock" role="alertdialog" aria-label="Gire o celular">
      <div className="rotate-lock-card">
        <div className="rotate-lock-icon" aria-hidden>
          📱↻
        </div>
        <h2 className="rotate-lock-title">GIRE O CELULAR!</h2>
        <p className="rotate-lock-sub">
          Banana é melhor jogada na vertical.
        </p>
      </div>
    </div>
  );
}
