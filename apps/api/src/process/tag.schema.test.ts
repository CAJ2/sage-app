import { ZService } from '@src/common/z.service'
import { TagType } from '@src/process/tag.entity'
import { TagSchemaService } from '@src/process/tag.schema'

const VALID_NANOID = 'V1StGXR8_Z5jdHi6B-myT'

describe('TagSchemaService', () => {
  let service: TagSchemaService

  beforeEach(() => {
    const zService = new ZService({ get: () => undefined } as any)
    service = new TagSchemaService(zService)
  })

  describe('parseCreateInput', () => {
    it('accepts a valid minimal input', async () => {
      await expect(
        service.parseCreateInput({ name: 'Plastic', type: TagType.ITEM }),
      ).resolves.toBeDefined()
    })

    it('accepts a valid full input', async () => {
      await expect(
        service.parseCreateInput({
          name: 'Recyclable',
          type: TagType.VARIANT,
          desc: 'Can be recycled',
          bgColor: '#FF5733',
          image: 'https://example.com/icon.png',
        }),
      ).resolves.toBeDefined()
    })

    it('accepts a valid icon:// image URL', async () => {
      await expect(
        service.parseCreateInput({ name: 'Tag', type: TagType.COMPONENT, image: 'icon://recycle' }),
      ).resolves.toBeDefined()
    })

    it('accepts all valid tag types', async () => {
      const types = [
        TagType.PLACE,
        TagType.ITEM,
        TagType.VARIANT,
        TagType.COMPONENT,
        TagType.PROCESS,
        TagType.ORG,
      ] as const
      for (const type of types) {
        await expect(service.parseCreateInput({ name: 'Test', type })).resolves.toBeDefined()
      }
    })

    it('rejects input with missing required name', async () => {
      await expect(service.parseCreateInput({ type: TagType.ITEM } as any)).rejects.toMatchObject({
        issues: expect.arrayContaining([expect.objectContaining({ path: ['name'] })]),
      })
    })

    it('rejects input with missing required type', async () => {
      await expect(service.parseCreateInput({ name: 'Tag' } as any)).rejects.toMatchObject({
        issues: expect.arrayContaining([expect.objectContaining({ path: ['type'] })]),
      })
    })

    it('rejects an invalid tag type enum value', async () => {
      await expect(
        service.parseCreateInput({ name: 'Tag', type: 'MATERIAL' as any }),
      ).rejects.toMatchObject({
        issues: expect.arrayContaining([expect.objectContaining({ path: ['type'] })]),
      })
    })

    it('rejects bgColor that is not a valid hex color', async () => {
      await expect(
        service.parseCreateInput({ name: 'Tag', type: TagType.ITEM, bgColor: 'red' }),
      ).rejects.toMatchObject({
        issues: expect.arrayContaining([expect.objectContaining({ path: ['bgColor'] })]),
      })
    })

    it('rejects bgColor with only 3 hex digits instead of 6', async () => {
      await expect(
        service.parseCreateInput({ name: 'Tag', type: TagType.ITEM, bgColor: '#FFF' }),
      ).rejects.toMatchObject({
        issues: expect.arrayContaining([expect.objectContaining({ path: ['bgColor'] })]),
      })
    })

    it('rejects bgColor without leading hash', async () => {
      await expect(
        service.parseCreateInput({ name: 'Tag', type: TagType.ITEM, bgColor: 'FF5733' }),
      ).rejects.toMatchObject({
        issues: expect.arrayContaining([expect.objectContaining({ path: ['bgColor'] })]),
      })
    })

    it('rejects image URL with http:// protocol', async () => {
      await expect(
        service.parseCreateInput({
          name: 'Tag',
          type: TagType.ITEM,
          image: 'http://example.com/icon.png',
        }),
      ).rejects.toMatchObject({
        issues: expect.arrayContaining([expect.objectContaining({ path: ['image'] })]),
      })
    })

    it('rejects image that is not a URL', async () => {
      await expect(
        service.parseCreateInput({ name: 'Tag', type: TagType.ITEM, image: 'not-a-url' }),
      ).rejects.toMatchObject({
        issues: expect.arrayContaining([expect.objectContaining({ path: ['image'] })]),
      })
    })
  })

  describe('parseUpdateInput', () => {
    it('accepts a valid minimal update with only an id', async () => {
      await expect(service.parseUpdateInput({ id: VALID_NANOID })).resolves.toBeDefined()
    })

    it('accepts a valid full update', async () => {
      await expect(
        service.parseUpdateInput({
          id: VALID_NANOID,
          name: 'Updated Tag',
          type: TagType.PROCESS,
          bgColor: '#123ABC',
          image: 'https://example.com/new-icon.png',
        }),
      ).resolves.toBeDefined()
    })

    it('rejects input with missing id', async () => {
      await expect(service.parseUpdateInput({} as any)).rejects.toMatchObject({
        issues: expect.arrayContaining([expect.objectContaining({ path: ['id'] })]),
      })
    })

    it('rejects invalid tag type on update', async () => {
      await expect(
        service.parseUpdateInput({ id: VALID_NANOID, type: 'INVALID' as any }),
      ).rejects.toMatchObject({
        issues: expect.arrayContaining([expect.objectContaining({ path: ['type'] })]),
      })
    })

    it('rejects bgColor without leading hash on update', async () => {
      await expect(
        service.parseUpdateInput({ id: VALID_NANOID, bgColor: 'AABBCC' }),
      ).rejects.toMatchObject({
        issues: expect.arrayContaining([expect.objectContaining({ path: ['bgColor'] })]),
      })
    })

    it('rejects image with http:// protocol on update', async () => {
      await expect(
        service.parseUpdateInput({ id: VALID_NANOID, image: 'http://example.com/icon.png' }),
      ).rejects.toMatchObject({
        issues: expect.arrayContaining([expect.objectContaining({ path: ['image'] })]),
      })
    })
  })
})
