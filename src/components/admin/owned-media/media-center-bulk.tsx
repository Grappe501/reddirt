"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { OwnedMediaColorLabel, OwnedMediaPickStatus } from "@prisma/client";
import { bulkMediaCenterGovernanceAction } from "@/app/admin/owned-media-actions";

type Col = { id: string; name: string; isSmart: boolean };

type BulkCtx = {
  selectedIds: Set<string>;
  toggle: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clear: () => void;
};

const Ctx = createContext<BulkCtx | null>(null);

export function useMediaCenterBulk(): BulkCtx | null {
  return useContext(Ctx);
}

export function MediaCenterBulkProvider({
  children,
  returnPath,
  collections,
}: {
  children: ReactNode;
  returnPath: string;
  collections: Col[];
}) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());

  const toggle = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback((ids: string[]) => {
    setSelectedIds(new Set(ids));
  }, []);

  const clear = useCallback(() => setSelectedIds(new Set()), []);

  const value = useMemo(
    () => ({ selectedIds, toggle, selectAll, clear }),
    [selectedIds, toggle, selectAll, clear]
  );

  const manualCollections = collections.filter((c) => !c.isSmart);
  const n = selectedIds.size;
  const idList = [...selectedIds].join(",");

  return (
    <Ctx.Provider value={value}>
      {children}
      {n > 0 ? (
        <div className="sticky bottom-0 z-20 mt-3 border-t border-kelly-text/15 bg-kelly-page/95 px-2 py-2 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] backdrop-blur-sm">
          <div className="mx-auto flex max-w-[1920px] flex-col gap-2 md:flex-row md:flex-wrap md:items-center md:gap-3">
            <span className="font-body text-xs font-semibold text-kelly-text">
              {n} selected
            </span>
            <button
              type="button"
              className="rounded border border-kelly-text/20 px-2 py-1 text-[10px] font-semibold text-kelly-text"
              onClick={() => clear()}
            >
              Clear selection
            </button>

            <BulkMiniForm
              label="Favorite on"
              intent="favorite_on"
              idList={idList}
              returnPath={returnPath}
            />
            <BulkMiniForm
              label="Favorite off"
              intent="favorite_off"
              idList={idList}
              returnPath={returnPath}
            />

            <BulkPickForm idList={idList} returnPath={returnPath} />
            <BulkColorForm idList={idList} returnPath={returnPath} />

            <BulkMiniForm label="Press on" intent="press_on" idList={idList} returnPath={returnPath} />
            <BulkMiniForm label="Press off" intent="press_off" idList={idList} returnPath={returnPath} />
            <BulkMiniForm label="Site on" intent="site_on" idList={idList} returnPath={returnPath} />
            <BulkMiniForm label="Site off" intent="site_off" idList={idList} returnPath={returnPath} />

            <BulkMiniForm
              label="Mark reviewed"
              intent="mark_reviewed"
              idList={idList}
              returnPath={returnPath}
            />
            <BulkMiniForm
              label="Clear reviewed"
              intent="clear_reviewed"
              idList={idList}
              returnPath={returnPath}
            />

            <BulkMiniForm
              label="Clear pick & color"
              intent="clear_pick_and_color"
              idList={idList}
              returnPath={returnPath}
            />

            {manualCollections.length > 0 ? (
              <form action={bulkMediaCenterGovernanceAction} className="flex flex-wrap items-center gap-1">
                <input type="hidden" name="assetIds" value={idList} />
                <input type="hidden" name="returnPath" value={returnPath} />
                <input type="hidden" name="intent" value="add_to_collection" />
                <select
                  name="collectionId"
                  required
                  className="max-w-[10rem] rounded border border-kelly-text/20 bg-white px-1 py-0.5 text-[10px]"
                >
                  <option value="">Collection…</option>
                  {manualCollections.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="rounded bg-kelly-text px-2 py-0.5 text-[10px] font-semibold text-kelly-page"
                >
                  Add
                </button>
              </form>
            ) : null}
          </div>
        </div>
      ) : null}
    </Ctx.Provider>
  );
}

function BulkMiniForm({
  label,
  intent,
  idList,
  returnPath,
}: {
  label: string;
  intent:
    | "favorite_on"
    | "favorite_off"
    | "press_on"
    | "press_off"
    | "site_on"
    | "site_off"
    | "mark_reviewed"
    | "clear_reviewed"
    | "clear_pick_and_color";
  idList: string;
  returnPath: string;
}) {
  return (
    <form action={bulkMediaCenterGovernanceAction} className="inline">
      <input type="hidden" name="assetIds" value={idList} />
      <input type="hidden" name="returnPath" value={returnPath} />
      <input type="hidden" name="intent" value={intent} />
      <button
        type="submit"
        className="rounded border border-kelly-text/25 bg-white px-2 py-0.5 text-[10px] font-semibold text-kelly-text hover:bg-kelly-text/5"
      >
        {label}
      </button>
    </form>
  );
}

function BulkPickForm({ idList, returnPath }: { idList: string; returnPath: string }) {
  return (
    <form action={bulkMediaCenterGovernanceAction} className="flex items-center gap-1">
      <input type="hidden" name="assetIds" value={idList} />
      <input type="hidden" name="returnPath" value={returnPath} />
      <input type="hidden" name="intent" value="set_pick" />
      <select
        name="pickStatus"
        className="rounded border border-kelly-text/20 bg-white px-1 py-0.5 text-[10px]"
        defaultValue={OwnedMediaPickStatus.UNRATED}
      >
        {(Object.values(OwnedMediaPickStatus) as OwnedMediaPickStatus[]).map((p) => (
          <option key={p} value={p}>
            Pick: {p}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="rounded bg-kelly-slate/90 px-2 py-0.5 text-[10px] font-semibold text-kelly-page"
      >
        Apply
      </button>
    </form>
  );
}

function BulkColorForm({ idList, returnPath }: { idList: string; returnPath: string }) {
  return (
    <form action={bulkMediaCenterGovernanceAction} className="flex items-center gap-1">
      <input type="hidden" name="assetIds" value={idList} />
      <input type="hidden" name="returnPath" value={returnPath} />
      <input type="hidden" name="intent" value="set_color" />
      <select
        name="colorLabel"
        className="rounded border border-kelly-text/20 bg-white px-1 py-0.5 text-[10px]"
        defaultValue={OwnedMediaColorLabel.NONE}
      >
        {(Object.values(OwnedMediaColorLabel) as OwnedMediaColorLabel[]).map((c) => (
          <option key={c} value={c}>
            {c === "NONE" ? "Color: —" : `Color: ${c}`}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="rounded bg-kelly-slate/90 px-2 py-0.5 text-[10px] font-semibold text-kelly-page"
      >
        Apply
      </button>
    </form>
  );
}

export function MediaCenterSelectCheckbox({
  assetId,
  className = "",
}: {
  assetId: string;
  className?: string;
}) {
  const ctx = useMediaCenterBulk();
  if (!ctx) return null;
  const checked = ctx.selectedIds.has(assetId);
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={() => ctx.toggle(assetId)}
      onClick={(e) => e.stopPropagation()}
      className={`h-3.5 w-3.5 cursor-pointer rounded border-kelly-text/40 text-kelly-text ${className}`}
      aria-label={`Select asset ${assetId.slice(0, 8)}`}
    />
  );
}

export function MediaCenterSelectAllOnPage({ pageIds }: { pageIds: string[] }) {
  const ctx = useMediaCenterBulk();
  if (!ctx || pageIds.length === 0) return null;
  return (
    <button
      type="button"
      className="rounded border border-kelly-text/20 px-2 py-0.5 text-[10px] font-semibold text-kelly-text"
      onClick={() => ctx.selectAll(pageIds)}
    >
      Select all on page ({pageIds.length})
    </button>
  );
}
