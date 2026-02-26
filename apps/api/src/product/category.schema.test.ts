import { BaseSchemaService } from '@src/common/base.schema'
import { ZService } from '@src/common/z.service'
import { CategorySchemaService } from '@src/product/category.schema'

const VALID_NANOID = 'V1StGXR8_Z5jdHi6B-myT'

describe('CategorySchemaService', () => {
  let service: CategorySchemaService

  beforeEach(() => {
    const mockI18n = { t: () => '' } as any
    const baseSchema = new BaseSchemaService(mockI18n)
    const zService = new ZService({ get: () => undefined } as any)
    service = new CategorySchemaService(mockI18n, baseSchema, zService)
  })

  describe('parseCreateInput', () => {
    it('accepts a valid empty input (all fields optional)', async () => {
      await expect(service.parseCreateInput({} as any)).resolves.toBeDefined()
    })

    it('accepts a valid full input', async () => {
      await expect(
        service.parseCreateInput({
          name: 'Electronics',
          descShort: 'Electronic devices',
          desc: 'A category for all electronic products',
          imageURL: 'https://example.com/category.png',
          nameTr: [{ lang: 'en', text: 'Electronics' }],
        } as any),
      ).resolves.toBeDefined()
    })

    it('rejects imageURL with http:// protocol', async () => {
      await expect(
        service.parseCreateInput({ imageURL: 'http://example.com/image.png' } as any),
      ).rejects.toMatchObject({
        issues: expect.arrayContaining([expect.objectContaining({ path: ['imageURL'] })]),
      })
    })

    it('rejects imageURL that is not a URL', async () => {
      await expect(
        service.parseCreateInput({ imageURL: 'not-a-url' } as any),
      ).rejects.toMatchObject({
        issues: expect.arrayContaining([expect.objectContaining({ path: ['imageURL'] })]),
      })
    })

    it('rejects nameTr with an invalid language code', async () => {
      await expect(
        service.parseCreateInput({ nameTr: [{ lang: 'x', text: 'Hi' }] } as any),
      ).rejects.toMatchObject({
        issues: expect.arrayContaining([
          expect.objectContaining({ path: expect.arrayContaining(['nameTr']) }),
        ]),
      })
    })
  })

  describe('parseUpdateInput', () => {
    it('accepts a valid minimal update with only an id', async () => {
      await expect(
        service.parseUpdateInput({ id: 'some-category-id' } as any),
      ).resolves.toBeDefined()
    })

    it('accepts a valid full update', async () => {
      await expect(
        service.parseUpdateInput({
          id: 'some-category-id',
          name: 'Updated Category',
          descShort: 'Short desc',
          desc: 'Full description',
          imageURL: 'https://example.com/new-image.png',
        } as any),
      ).resolves.toBeDefined()
    })

    it('rejects input with missing id', async () => {
      await expect(service.parseUpdateInput({} as any)).rejects.toMatchObject({
        issues: expect.arrayContaining([expect.objectContaining({ path: ['id'] })]),
      })
    })

    it('rejects imageURL with http:// protocol on update', async () => {
      await expect(
        service.parseUpdateInput({ id: 'cat1', imageURL: 'http://insecure.com/img.png' } as any),
      ).rejects.toMatchObject({
        issues: expect.arrayContaining([expect.objectContaining({ path: ['imageURL'] })]),
      })
    })
  })

  describe('parseDeleteInput', () => {
    it('accepts a valid delete input', async () => {
      await expect(service.parseDeleteInput({ id: VALID_NANOID })).resolves.toBeDefined()
    })

    it('rejects delete input with missing id', async () => {
      await expect(service.parseDeleteInput({} as any)).rejects.toMatchObject({
        issues: expect.arrayContaining([expect.objectContaining({ path: ['id'] })]),
      })
    })
  })
})
