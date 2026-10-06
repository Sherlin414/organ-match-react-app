import { GoogleIcon } from '../../assets/brandIcons';

export function GoogleButton({ onClick, text = 'Continue with Google', loading = false, disabled = false, style }) {
  return (
    <button
      type="button"
      className="btn-google"
      onClick={onClick}
      disabled={disabled || loading}
      style={style}
    >
      <GoogleIcon size={20} />
      <span>{loading ? 'Connecting with Google...' : text}</span>
    </button>
  );
}
