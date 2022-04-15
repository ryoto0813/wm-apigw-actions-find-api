const axios = require('axios');
const fs = require('fs');

const index = require('./index');

const apigw_url = 'https://localhost:5555';
const username = 'username';
const password = 'password';

const allApis = JSON.parse(fs.readFileSync('all-apis.json'));

jest.mock('axios');
const mocked_axios = jest.mocked(axios, true);
mocked_axios.get.mockResolvedValue({ status: 200, data: allApis});

afterAll(() => {
    jest.clearAllMocks();
})

describe('Unit tests for findApi', () => {
    test('findApi Swagger Petstore with version 1.0.6', () => {
        let api = index.findApi(allApis, 'Swagger Petstore', '1.0.6');
        expect(api).not.toBeNull();
        expect(api.apiName).toBe('Swagger Petstore');
        expect(api.apiVersion).toBe('1.0.6');
    });
    
    test('findApi Swagger Petstore with version 1.0.7', () => {
        let api = index.findApi(allApis, 'Swagger Petstore', '1.0.7');
        expect(api).toBeNull();
    });
    
    test('findApi DoesNotExist with version 1.0.6', () => {
        let api = index.findApi(allApis, 'DoesNotExist', '1.0.6');
        expect(api).toBeNull();
    });
});

describe('Unit tests for getAllApis', () => { 
    test('getAllApis with mocked response', async () => {
        let newAllApis = await index.getAllApis(apigw_url, username, password);
        
        expect(mocked_axios.get).toHaveBeenCalledWith(
            `${apigw_url}/rest/apigateway/apis`, 
            { 
                'auth': { 
                    'username' : username,
                    'password': password
                },
                'headers': {
                    'Accept': 'application/json'
                }
            }
            );
        expect(newAllApis).not.toBeNull();
        expect(newAllApis).toEqual(allApis);
    })
});

describe('Unit tests for run', () => {
    let mocked_stdout;
    let stdout_lines

    afterAll(() => {
        mocked_stdout.mockClear();
    })

    beforeAll(() => {
        process.env['INPUT_APIGW-URL'] = apigw_url;
        process.env['INPUT_APIGW-USER'] = username;
        process.env['INPUT_APIGW-PASSWORD'] = password;
        process.env['INPUT_API-NAME'] = 'Swagger Petstore';
        process.env['INPUT_FAIL-IF-NOT-FOUND'] = true;

        mocked_stdout = jest.spyOn(process.stdout, 'write').mockImplementation((line) => {
            stdout_lines.push(line.trim());
            return true; 
        });
    });

    beforeEach(() => {
        stdout_lines = [];
    });

    test('run Swagger Petstore with version 1.0.6', async () => {
        process.env['INPUT_API-VERSION'] = '1.0.6';

        const expected_api_id = '::set-output name=api-id::e6536d45-4bb2-45b8-9a38-21976e924741';
        const expected_api_name = '::set-output name=api-name::Swagger Petstore';
        const expected_api_version = '::set-output name=api-version::1.0.6';
        const expected_api_type = '::set-output name=api-type::REST';
        const expected_api_is_active = '::set-output name=api-is-active::true';

        await index.run();

        expect(stdout_lines).toContain(expected_api_id);
        expect(stdout_lines).toContain(expected_api_name);
        expect(stdout_lines).toContain(expected_api_version);
        expect(stdout_lines).toContain(expected_api_type);
        expect(stdout_lines).toContain(expected_api_is_active);
    });

    test('run Swagger Petstore with version 1.0.7 and fail', async () => {
        process.env['INPUT_API-VERSION'] = '1.0.7';
        
        const expected_error = '::error::API project Swagger Petstore with version 1.0.7 not found!';

        await index.run();

        expect(stdout_lines).toContain(expected_error);
    });

    test('run Swagger Petstore with version 1.0.7 and do not fail', async () => {
        process.env['INPUT_API-VERSION'] = '1.0.7';
        process.env['INPUT_FAIL-IF-NOT-FOUND'] = false;

        const expected_api_id = '::set-output name=api-id::';
        const expected_api_name = '::set-output name=api-name::';
        const expected_api_version = '::set-output name=api-version::';
        const expected_api_type = '::set-output name=api-type::';
        const expected_api_is_active = '::set-output name=api-is-active::false';

        await index.run();

        expect(stdout_lines).toContain(expected_api_id);
        expect(stdout_lines).toContain(expected_api_name);
        expect(stdout_lines).toContain(expected_api_version);
        expect(stdout_lines).toContain(expected_api_type);
        expect(stdout_lines).toContain(expected_api_is_active);
    });
});