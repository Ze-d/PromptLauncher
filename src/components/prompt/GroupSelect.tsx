// GroupSelect.tsx — Group dropdown selector with "no group" option

interface Props {
  value: number | null;
  onChange: (groupId: number | null) => void;
  groups: { id: number; name: string }[];
  disabled?: boolean;
}

export default function GroupSelect({ value, onChange, groups, disabled }: Props) {
  return (
    <select
      value={value ?? ""}
      onChange={(e) => {
        const v = e.target.value;
        onChange(v === "" ? null : Number(v));
      }}
      disabled={disabled}
      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
    >
      <option value="">No group</option>
      {groups.map((g) => (
        <option key={g.id} value={g.id}>
          {g.name}
        </option>
      ))}
    </select>
  );
}
