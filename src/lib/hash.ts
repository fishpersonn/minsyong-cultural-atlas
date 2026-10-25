export function parseHash(hash: string): string | null {
  const m = /^#p=(\d+)$/.exec(hash)
  return m ? m[1] : null
}

export function buildHash(id: string | null): string {
  return id === null ? '' : `#p=${id}`
}
