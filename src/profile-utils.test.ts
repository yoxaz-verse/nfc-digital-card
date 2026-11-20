import { describe,expect,it } from 'vitest'
import { formatInTimezone,isLinkActive,isValidSlug,zonedInputToUtc } from './profile-utils'
import type { ProfileLink } from './types'
const link=(patch:Partial<ProfileLink>={}):ProfileLink=>({id:'1',platform:'website',label:'Site',url:'https://example.com',enabled:true,order:0,featured:false,...patch})
describe('profile publishing helpers',()=>{
  it('rejects malformed and reserved slugs',()=>{expect(isValidSlug('good-name')).toBe(true);expect(isValidSlug('admin')).toBe(false);expect(isValidSlug('No Spaces')).toBe(false)})
  it('applies schedule boundaries',()=>{const at=Date.parse('2026-01-02T12:00:00Z');expect(isLinkActive(link({startsAt:'2026-01-02T11:00:00Z'}),at)).toBe(true);expect(isLinkActive(link({endsAt:'2026-01-02T12:00:00Z'}),at)).toBe(false)})
  it('round-trips creator-local time through UTC',()=>{const utc=zonedInputToUtc('2026-11-20T17:30','Asia/Kolkata');expect(utc).toBe('2026-11-20T12:00:00.000Z');expect(formatInTimezone(utc,'Asia/Kolkata')).toBe('2026-11-20T17:30')})
})
