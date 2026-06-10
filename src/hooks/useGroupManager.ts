// useGroupManager.ts — Group CRUD state + actions extracted from MainPage
import { useState, useEffect, useRef } from "react";
import { useGroupStore } from "../stores/groupStore";
import type { Group } from "../types/prompt";

export interface GroupManager {
  activeGroup: string;
  setActiveGroup: (id: string) => void;
  groups: Group[];

  // Add group
  addingGroup: boolean;
  startAddGroup: () => void;
  cancelAddGroup: () => void;
  submitAddGroup: () => void;
  groupNameInput: string;
  setGroupNameInput: (v: string) => void;
  addInputRef: React.RefObject<HTMLInputElement>;

  // Edit/delete group
  editingGroupId: number | null;
  toggleEditGroup: (g: Group) => void;
  removeGroup: (g: Group) => void;
  editInputRef: React.RefObject<HTMLInputElement>;
}

export function useGroupManager(): GroupManager {
  const { groups, loadGroups, createGroup, updateGroup, deleteGroup } =
    useGroupStore();

  const [activeGroup, setActiveGroup] = useState("all");
  const [addingGroup, setAddingGroup] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<number | null>(null);
  const [groupNameInput, setGroupNameInput] = useState("");

  const addInputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  useEffect(() => {
    if (addingGroup && addInputRef.current) {
      addInputRef.current.focus();
    }
    if (editingGroupId !== null && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [addingGroup, editingGroupId]);

  function startAddGroup() {
    setAddingGroup(true);
    setGroupNameInput("");
  }

  function cancelAddGroup() {
    setAddingGroup(false);
    setGroupNameInput("");
  }

  async function submitAddGroup() {
    const name = groupNameInput.trim();
    if (!name) {
      cancelAddGroup();
      return;
    }
    try {
      const g = await createGroup({ name });
      setActiveGroup(String(g.id));
    } catch {
      // error handled by store
    }
    cancelAddGroup();
  }

  function toggleEditGroup(g: Group) {
    if (editingGroupId === g.id) {
      // Save
      const name = groupNameInput.trim();
      if (name && name !== g.name) {
        updateGroup({ id: g.id, name }).catch(() => {});
      }
      setEditingGroupId(null);
      setGroupNameInput("");
    } else {
      // Start editing
      setEditingGroupId(g.id);
      setGroupNameInput(g.name);
    }
  }

  async function removeGroup(g: Group) {
    if (
      !confirm(
        `Delete group "${g.name}"? Prompts in this group will be ungrouped.`,
      )
    )
      return;
    try {
      await deleteGroup(g.id);
      if (activeGroup === String(g.id)) {
        setActiveGroup("all");
      }
    } catch {
      // error handled by store
    }
  }

  return {
    activeGroup,
    setActiveGroup,
    groups,
    addingGroup,
    startAddGroup,
    cancelAddGroup,
    submitAddGroup,
    groupNameInput,
    setGroupNameInput,
    addInputRef,
    editingGroupId,
    toggleEditGroup,
    removeGroup,
    editInputRef,
  };
}
