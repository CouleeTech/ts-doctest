import { ControllerTestSuite, OperationTemplates } from '../../Front-End/ControllerTestSuite'

class MockControllerTestSuite extends ControllerTestSuite {
  public afterAll(): Promise<void> {
    throw new Error('Method not implemented.')
  }

  public beforeAll(): Promise<void> {
    throw new Error('Method not implemented.')
  }

  public static CheckPathTemplates(name: string): string[] | null {
    return this.CheckForPathTemplates(name)
  }

  public static FillPathWithTemplates(
    pathName: string,
    pathTemplates: string[],
    operationTemplates: OperationTemplates
  ) {
    return this.FillPathStringWithTemplates(pathName, pathTemplates, operationTemplates)
  }
}

describe('Controller Test Suite', () => {
  it('Should be able to detect templates in a path string', () => {
    const path1 = '/books/{id}'
    const expectedTemplates1 = ['id']
    const results1 = MockControllerTestSuite.CheckPathTemplates(path1)
    expect(results1).toEqual(expectedTemplates1)

    const path2 = '/hats/{color}/brand/{brand}'
    const expectedTemplates2 = ['color', 'brand']
    const results2 = MockControllerTestSuite.CheckPathTemplates(path2)
    expect(results2).toEqual(expectedTemplates2)

    const path3 = '/world/{country_id}/{region_id}/people/{person_id}'
    const expectedTemplates3 = ['country_id', 'region_id', 'person_id']
    const results3 = MockControllerTestSuite.CheckPathTemplates(path3)
    expect(results3).toEqual(expectedTemplates3)
  })

  it('Should be able to replace path string using template variables', () => {
    const path1 = '/cow/{id}'
    const pathTemplates1 = ['id']
    const operationTemplates1 = { id: '42' }
    const expectedPath1 = '/cow/42'
    const results1 = MockControllerTestSuite.FillPathWithTemplates(path1, pathTemplates1, operationTemplates1)
    expect(results1).toEqual(expectedPath1)

    const path2 = '/network/{network_name}/host/{host_name}'
    const pathTemplates2 = ['network_name', 'host_name']
    const operationTemplates2 = { network_name: 'bob', host_name: 'home' }
    const expectedPath2 = '/network/bob/host/home'
    const results2 = MockControllerTestSuite.FillPathWithTemplates(path2, pathTemplates2, operationTemplates2)
    expect(results2).toEqual(expectedPath2)

    const path3 = '/earth/{country}/{region}/person/{person}'
    const pathTemplates3 = ['country', 'region', 'person']
    const operationTemplates3 = { country: 'canada', region: 'north', person: 'bob' }
    const expectedPath3 = '/earth/canada/north/person/bob'
    const results3 = MockControllerTestSuite.FillPathWithTemplates(path3, pathTemplates3, operationTemplates3)
    expect(results3).toEqual(expectedPath3)
  })
})
