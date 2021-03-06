export const validRawData = () => [
  [{ results: { req: { method: 'test', headers: 'test', url: 'test' }, res: { headers: 'test', status: 'test' } } }],
  [
    { results: { req: { method: 'test', headers: 'test', url: 'test' }, res: { headers: 'test', status: 'test' } } },
    { results: { req: { method: 'test', headers: 'test', url: 'test' }, res: { headers: 'test', status: 'test' } } },
    { results: { req: { method: 'test', headers: 'test', url: 'test' }, res: { headers: 'test', status: 'test' } } }
  ]
]

export const invalidRawData = () => [
  [],
  {},
  null,
  undefined,
  'test',
  42,
  [{ results: [] }],
  [{ results: {} }],
  [{ results: { req: [] } }],
  [{ req: { method: 'test' } }],
  [{ results: { req: { method: 'test' } } }],
  { results: { req: { url: 'test' } } },
  [{ results: { req: { headers: 'test' } } }],
  [{ results: { req: { method: 'test', headers: 'test' } } }],
  [{ results: { req: { method: 'test', url: 'test' } } }],
  [{ results: { req: { headers: 'test', url: 'test' } } }],
  [{ results: { res: { headers: 'test', url: 'test' } } }],
  [{ results: { res: { url: 'test' } } }],
  [{ results: { res: { status: 'test' } } }],
  [{ results: { res: { headers: 'test', status: 'test' } } }],
  [{ results: { req: { headers: 'test', url: 'test' } }, res: { headers: 'test', url: 'test' } }],
  [{ results: { req: { method: 'test', headers: 'test', url: 'test' } }, res: { headers: 'test' } }],
  [{ results: { req: { method: 'test', headers: 'test', url: 'test' } }, res: { headers: 'test', status: 'test' } }],
  { results: { req: { method: 'test', headers: 'test', url: 'test' }, res: { headers: 'test', status: 'test' } } }
]

export const validRawApiResponse = () => [
  [
    '/workflow/projectManagement/project/create',
    [
      {
        path: '/workflow/projectManagement/project/create',
        results: {
          req: {
            method: 'POST',
            url: 'http://127.0.0.1:44561/workflow/projectManagement/project/create',
            data: {
              status: 'READY',
              title: 'Sample Data',
              description: 'This is for an example',
              due_date: '2018-10-12T05:00:00.000Z'
            },
            headers: {
              'user-agent': 'node-superagent/3.8.3',
              accept: 'application/json',
              'content-type': 'application/json',
              'x-organization': 'c7f628a5-7f0e-435d-bd1e-06543f9941b2'
            }
          },
          res: {
            body: {
              id: 'e97846d5-a8eb-4784-9edb-be59ee5323f8',
              created_by: {
                module_id: 'c7f628a5-7f0e-435d-bd1e-06543f9941b2',
                module_name: 'user'
              },
              status: 'READY',
              title: 'Sample Data',
              description: 'This is for an example',
              due_date: '2018-10-12T05:00:00.000Z'
            },
            headers: {
              'x-powered-by': 'Express',
              'content-type': 'application/json; charset=utf-8',
              'content-length': '248',
              etag: 'W/"f8-yb2ETmjW9VNreKkH4w59Z0j9Jgw"',
              date: 'Thu, 18 Oct 2018 01:06:40 GMT',
              connection: 'close'
            },
            status: 201
          }
        },
        requestHeaders: [
          {
            name: 'Accept',
            value: 'application/json'
          },
          {
            name: 'Content-Type',
            value: 'application/json'
          },
          {
            name: 'X-Organization',
            value: 'c7f628a5-7f0e-435d-bd1e-06543f9941b2',
            description: 'This is required in order to identify the organization this Project belongs to.'
          }
        ],
        requestBody: {
          data: {
            status: 'READY',
            title: 'Sample Data',
            description: 'This is for an example',
            due_date: '2018-10-12T05:00:00.000Z'
          },
          description: 'A Project without the created_by and id fields.'
        },
        responseBody: {
          data: {
            id: 'e97846d5-a8eb-4784-9edb-be59ee5323f8',
            status: 'READY',
            title: 'Sample Data',
            description: 'This is for an example',
            due_date: '2018-10-12T05:00:00.000Z',
            created_by: {
              module_id: 'c7f628a5-7f0e-435d-bd1e-06543f9941b2',
              module_name: 'user'
            }
          },
          description: 'The Project from the request with the created_by and id fields added.'
        },
        responseStatus: {
          code: 201
        }
      }
    ]
  ],
  [
    '/workflow/projectManagement/project/delete',
    [
      {
        path: '/workflow/projectManagement/project/delete',
        results: {
          req: {
            method: 'POST',
            url: 'http://127.0.0.1:37581/workflow/projectManagement/project/delete',
            data: {
              id: 'e97846d5-a8eb-4784-9edb-be59ee5323f8'
            },
            headers: {
              'user-agent': 'node-superagent/3.8.3',
              accept: 'application/json',
              'content-type': 'application/json',
              'x-organization': 'c7f628a5-7f0e-435d-bd1e-06543f9941b2'
            }
          },
          res: {
            body: {
              id: 'e97846d5-a8eb-4784-9edb-be59ee5323f8',
              due_date: '2018-10-12T05:00:00.000Z',
              description: 'This is for an example',
              created_by: {
                module_id: 'c7f628a5-7f0e-435d-bd1e-06543f9941b2',
                module_name: 'user'
              },
              status: 'READY',
              title: 'Sample Data'
            },
            headers: {
              'x-powered-by': 'Express',
              'content-type': 'application/json; charset=utf-8',
              'content-length': '248',
              etag: 'W/"f8-D68B9YK+owgdyYK71kK3cMS/6YU"',
              date: 'Thu, 18 Oct 2018 01:06:40 GMT',
              connection: 'close'
            },
            status: 201
          }
        },
        requestHeaders: [
          {
            name: 'Accept',
            value: 'application/json'
          },
          {
            name: 'Content-Type',
            value: 'application/json'
          },
          {
            name: 'X-Organization',
            value: 'c7f628a5-7f0e-435d-bd1e-06543f9941b2'
          }
        ],
        requestBody: {
          data: {
            id: 'e97846d5-a8eb-4784-9edb-be59ee5323f8'
          },
          description: 'The id of the Project being deleted.'
        },
        responseBody: {
          data: {
            id: 'e97846d5-a8eb-4784-9edb-be59ee5323f8',
            status: 'READY',
            title: 'Sample Data',
            description: 'This is for an example',
            due_date: '2018-10-12T05:00:00.000Z',
            created_by: {
              module_id: 'c7f628a5-7f0e-435d-bd1e-06543f9941b2',
              module_name: 'user'
            }
          },
          description: 'The Project that was deleted.'
        },
        responseStatus: {
          code: 201
        }
      }
    ]
  ]
]
