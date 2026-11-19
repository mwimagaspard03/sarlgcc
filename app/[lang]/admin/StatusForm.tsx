// Boutons de changement de statut : un petit formulaire par statut proposé (sans le statut actuel).
export default function StatusForm({
  action,
  id,
  current,
  options,
}: {
  action: (formData: FormData) => Promise<void>;
  id: string;
  current: string;
  options: Record<string, string>;
}) {
  return (
    <div className="admin-actions">
      {Object.entries(options)
        .filter(([value]) => value !== current)
        .map(([value, label]) => (
          <form key={value} action={action}>
            <input type="hidden" name="id" value={id} />
            <input type="hidden" name="status" value={value} />
            <button type="submit" className="btn btn-outline btn-small">
              {label}
            </button>
          </form>
        ))}
    </div>
  );
}
