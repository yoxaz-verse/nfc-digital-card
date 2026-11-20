import { describe,expect,it } from 'vitest'
import { normalizeUrl,platformById } from './platforms'

describe('profile link helpers',()=>{
  it('adds a secure scheme to pasted links',()=>expect(normalizeUrl('instagram.com/linkcard')).toBe('https://instagram.com/linkcard'))
  it('rejects malformed links',()=>expect(normalizeUrl('not a link')).toBe(''))
  it('provides a fallback for custom links',()=>expect(platformById('custom').name).toBe('Link'))
})
