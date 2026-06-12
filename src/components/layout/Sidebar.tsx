// Sidebar.tsx — Group navigation sidebar with inline CRUD and collapse toggle
import type { GroupManager } from "../../hooks/useGroupManager";
import type { Group } from "../../types/prompt";

interface Props {
  gm: GroupManager;
  onNewPrompt: () => void;
  sidebarWidth: number;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export default function Sidebar({
  gm,
  onNewPrompt,
  sidebarWidth,
  collapsed,
  onToggleCollapse,
}: Props) {
  const sidebarBtn = (key: string, label: string, icon: string) => (
    <button
      onClick={() => gm.setActiveGroup(key)}
      title={collapsed ? label : undefined}
      className={`w-full text-left px-3 py-1.5 text-sm rounded-md truncate ${
        gm.activeGroup === key
          ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium"
          : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
      }`}
    >
      {collapsed ? icon : label}
    </button>
  );

  return (
    <aside
      className="border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col shrink-0 overflow-hidden"
      style={{ width: sidebarWidth }}
    >
      {/* Header */}
      <div className="p-4 pb-2 flex items-center justify-between">
        {!collapsed && (
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide truncate">
            Groups
          </h2>
        )}
        <div className="flex items-center gap-1">
          <button
            onClick={onToggleCollapse}
            className="text-gray-400 dark:text-gray-500 hover:text-blue-600 text-sm leading-none px-0.5"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? "▶" : "◀"}
          </button>
          {!collapsed && (
            <button
              onClick={() =>
                gm.addingGroup ? gm.cancelAddGroup() : gm.startAddGroup()
              }
              className="text-gray-400 dark:text-gray-500 hover:text-blue-600 text-lg leading-none px-1"
              title="Add group"
            >
              +
            </button>
          )}
        </div>
      </div>

      {/* Group list */}
      <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto">
        {sidebarBtn("all", "All Prompts", "📋")}
        {sidebarBtn("favorites", "★ Favorites", "★")}
        {sidebarBtn("recent", "🕐 Recent", "🕐")}

        {/* Custom groups */}
        {gm.groups.map((g) => (
          <GroupRow key={g.id} group={g} gm={gm} collapsed={collapsed} />
        ))}

        {/* Add group inline input */}
        {gm.addingGroup && !collapsed && (
          <div className="px-2 pt-1">
            <input
              ref={gm.addInputRef}
              type="text"
              value={gm.groupNameInput}
              onChange={(e) => gm.setGroupNameInput(e.target.value)}
              onBlur={gm.submitAddGroup}
              onKeyDown={(e) => {
                if (e.key === "Enter") gm.submitAddGroup();
                if (e.key === "Escape") gm.cancelAddGroup();
              }}
              placeholder="Group name…"
              className="w-full px-2 py-1 text-sm border border-blue-300 dark:border-blue-500 rounded outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
            />
          </div>
        )}
      </nav>

      {/* New Prompt button */}
      {!collapsed && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onNewPrompt}
            className="w-full px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
          >
            + New Prompt
          </button>
        </div>
      )}
    </aside>
  );
}

/** A single group row with hover actions for edit/delete. */
function GroupRow({
  group,
  gm,
  collapsed,
}: {
  group: Group;
  gm: GroupManager;
  collapsed: boolean;
}) {
  const isEditing = gm.editingGroupId === group.id;
  const isActive = gm.activeGroup === String(group.id);

  return (
    <div
      className={`group flex items-center rounded-md ${
        isActive
          ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium"
          : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
      }`}
    >
      {isEditing ? (
        <input
          ref={gm.editInputRef}
          type="text"
          value={gm.groupNameInput}
          onChange={(e) => gm.setGroupNameInput(e.target.value)}
          onBlur={() => gm.toggleEditGroup(group)}
          onKeyDown={(e) => {
            if (e.key === "Enter") gm.toggleEditGroup(group);
            if (e.key === "Escape") {
              gm.setGroupNameInput(group.name);
              gm.toggleEditGroup(group);
            }
          }}
          className="flex-1 px-2 py-1 text-sm bg-white dark:bg-gray-700 dark:text-gray-100 border border-blue-300 rounded outline-none"
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <>
          <button
            onClick={() => gm.setActiveGroup(String(group.id))}
            className="flex-1 text-left px-3 py-1.5 text-sm truncate"
            title={group.name}
          >
            {collapsed ? "●" : group.name}
          </button>
          {!collapsed && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  gm.toggleEditGroup(group);
                }}
                className="hidden group-hover:block px-1 text-xs text-gray-400 dark:text-gray-500 hover:text-blue-600"
                title="Rename group"
              >
                ✎
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  gm.removeGroup(group);
                }}
                className="hidden group-hover:block px-1 text-xs text-gray-400 dark:text-gray-500 hover:text-red-600"
                title="Delete group"
              >
                ✕
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
}
