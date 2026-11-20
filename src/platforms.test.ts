import { describe,expect,it } from 'vitest'
import { normalizeUrl,platformById,platforms } from './platforms'

describe('profile link helpers',()=>{
  it('adds a secure scheme to pasted links',()=>expect(normalizeUrl('instagram.com/linkcard')).toBe('https://instagram.com/linkcard'))
  it('rejects malformed links',()=>expect(normalizeUrl('not a link')).toBe(''))
  it('provides a fallback for custom links',()=>expect(platformById('custom').name).toBe('Link'))
  it('provides display metadata for every supported platform',()=>expect(platforms.every(p=>p.name&&p.color&&p.placeholder)).toBe(true))
})
