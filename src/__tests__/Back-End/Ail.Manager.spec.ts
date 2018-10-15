import { AilManager, AilStorageEngineType } from '../../Back-End/Ail.Manager'
import { RawDocContainer } from '../../Common'

beforeAll(() => {
  it('Should not accept a filesystem storage engine during testing', () => {
    expect(AilManager.Init({ storageEngine: AilStorageEngineType.FILE })).toThrow(Error)
  })

  it('Should not allow containers to be consumed before being initialized', () => {
    const testContainer = new RawDocContainer({ controller: 'test' })
    expect(AilManager.ConsumeContainer(testContainer)).toThrow(Error)
  })

  AilManager.Init({ storageEngine: AilStorageEngineType.MEMORY })

  it('Should only be initialized once', () => {
    expect(AilManager.Init({ storageEngine: AilStorageEngineType.MEMORY })).toThrow(Error)
  })
})

describe('AIL Manager', () => {
  it('Exists', () => {
    expect(AilManager).toBeDefined()
  })
})
