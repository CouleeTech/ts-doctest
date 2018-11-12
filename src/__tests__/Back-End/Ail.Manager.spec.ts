import { AilManager } from '../../Back-End/Ail.Manager'
import { RawDocContainer } from '../../Common'
import { AilStorageEngineType } from '../../Config/Config'

beforeAll(() => {
  AilManager.Init({ storageEngine: AilStorageEngineType.MEMORY })
})

describe('AIL Manager', () => {
  it('Should only be initialized once', () => {
    expect(() =>
      AilManager.Init({
        storageEngine: AilStorageEngineType.MEMORY
      })
    ).toThrow(Error)
  })

  it('Properly consumes ApiResultContainers', () => {
    const testContainer1 = new RawDocContainer({ controller: 'test' })
    AilManager.ConsumeContainer(testContainer1)
    expect(AilManager).toBeDefined()
  })
})
