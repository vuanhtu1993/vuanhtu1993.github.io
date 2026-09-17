import React, { createContext, useContext, useState, useCallback } from 'react';

const EditModeContext = createContext({
  isEditMode: false,
  toggleEditMode: () => {},
  isDevMode: false,
  saveStatus: 'idle',
  updateTopic: async () => {},
  deleteTopic: async () => {},
  updateModule: async () => {},
  deleteModule: async () => {},
  searchTopics: async () => [],
  addRefChildTopic: async () => {},
  unlinkChildTopic: async () => {},
});

export function EditModeProvider({ children, slug, onDataChanged }) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle'); // idle | saving | saved | error

  const isDevMode = process.env.NODE_ENV === 'development';

  const toggleEditMode = useCallback(() => {
    if (!isDevMode) return;
    setIsEditMode((prev) => !prev);
  }, [isDevMode]);

  // Cập nhật thông tin 1 topic
  const updateTopic = useCallback(
    async (nodeId, updates) => {
      setSaveStatus('saving');
      try {
        const res = await fetch(`/api/roadmap/${slug}/topic/${nodeId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Cập nhật topic thất bại');
        }
        setSaveStatus('saved');
        if (onDataChanged) await onDataChanged();
        setTimeout(() => setSaveStatus('idle'), 2000);
        return await res.json();
      } catch (err) {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
        throw err;
      }
    },
    [slug, onDataChanged]
  );

  // Xoá 1 topic
  const deleteTopic = useCallback(
    async (nodeId) => {
      setSaveStatus('saving');
      try {
        const res = await fetch(`/api/roadmap/${slug}/topic/${nodeId}`, {
          method: 'DELETE',
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Xoá topic thất bại');
        }
        setSaveStatus('saved');
        if (onDataChanged) await onDataChanged();
        setTimeout(() => setSaveStatus('idle'), 2000);
        return await res.json();
      } catch (err) {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
        throw err;
      }
    },
    [slug, onDataChanged]
  );

  // Cập nhật thông tin 1 module
  const updateModule = useCallback(
    async (moduleId, updates) => {
      setSaveStatus('saving');
      try {
        const res = await fetch(`/api/roadmap/${slug}/module/${moduleId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Cập nhật module thất bại');
        }
        setSaveStatus('saved');
        if (onDataChanged) await onDataChanged();
        setTimeout(() => setSaveStatus('idle'), 2000);
        return await res.json();
      } catch (err) {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
        throw err;
      }
    },
    [slug, onDataChanged]
  );

  // Xoá 1 module
  const deleteModule = useCallback(
    async (moduleId) => {
      setSaveStatus('saving');
      try {
        const res = await fetch(`/api/roadmap/${slug}/module/${moduleId}`, {
          method: 'DELETE',
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Xoá module thất bại');
        }
        setSaveStatus('saved');
        if (onDataChanged) await onDataChanged();
        setTimeout(() => setSaveStatus('idle'), 2000);
        return await res.json();
      } catch (err) {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
        throw err;
      }
    },
    [slug, onDataChanged]
  );

  // Tìm kiếm topic trên toàn hệ thống MongoDB (hỗ trợ cả gợi ý khi keyword rỗng)
  const searchTopics = useCallback(async (keyword = '', excludeNodeId = '') => {
    try {
      const q = (keyword || '').trim();
      const url = `/api/roadmap/search-topics?q=${encodeURIComponent(
        q
      )}&excludeNodeId=${encodeURIComponent(excludeNodeId)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Không thể tìm kiếm chủ đề');
      return await res.json();
    } catch (err) {
      console.error('Lỗi tìm kiếm topics:', err);
      return [];
    }
  }, []);

  // Gán 1 topic con bằng tham chiếu (ref)
  const addRefChildTopic = useCallback(
    async (parentNodeId, { sourceRoadmapSlug, sourceNodeId, moduleId }) => {
      setSaveStatus('saving');
      try {
        const res = await fetch(`/api/roadmap/${slug}/topic/${parentNodeId}/ref-child`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sourceRoadmapSlug, sourceNodeId, moduleId }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Gán topic con thất bại');
        }
        setSaveStatus('saved');
        if (onDataChanged) await onDataChanged();
        setTimeout(() => setSaveStatus('idle'), 2000);
        return await res.json();
      } catch (err) {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
        throw err;
      }
    },
    [slug, onDataChanged]
  );

  // Gỡ liên kết topic con (unlink ref node)
  const unlinkChildTopic = useCallback(
    async (refNodeId) => {
      setSaveStatus('saving');
      try {
        const res = await fetch(`/api/roadmap/${slug}/topic/${refNodeId}/unlink`, {
          method: 'DELETE',
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Gỡ liên kết topic thất bại');
        }
        setSaveStatus('saved');
        if (onDataChanged) await onDataChanged();
        setTimeout(() => setSaveStatus('idle'), 2000);
        return await res.json();
      } catch (err) {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
        throw err;
      }
    },
    [slug, onDataChanged]
  );

  return (
    <EditModeContext.Provider
      value={{
        isEditMode: isDevMode && isEditMode,
        toggleEditMode,
        isDevMode,
        saveStatus,
        updateTopic,
        deleteTopic,
        updateModule,
        deleteModule,
        searchTopics,
        addRefChildTopic,
        unlinkChildTopic,
      }}
    >
      {children}
    </EditModeContext.Provider>
  );
}

export function useEditMode() {
  return useContext(EditModeContext);
}
