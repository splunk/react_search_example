import './App.css';
import { useState, useEffect, useCallback } from 'react';
import { presets, formInputTypes } from '../constants';

//@splunk/visualizations imports
//These are visualizations we are using for this demo
import SingleValue from '@splunk/visualizations/SingleValue';
import Line from '@splunk/visualizations/Line';

//@splunk/react-ui imports.
//These are what give us components that look and feel like Splunk.
import Link from '@splunk/react-ui/Link';
import List from '@splunk/react-ui/List';
import P from '@splunk/react-ui/Paragraph';
import WaitSpinner from '@splunk/react-ui/WaitSpinner';
import Heading from '@splunk/react-ui/Heading';
import Select from '@splunk/react-ui/Select';
import SplunkThemeProvider from '@splunk/themes/SplunkThemeProvider';

//@splunk/react-search imports.
//These are what give us a search bar and time picker
import SearchBar from '@splunk/react-search/components/Bar';

//@splunk/splunk-utils imports.
//This is what is used to create search jobs
import { createSearchJob, getData } from '@splunk/splunk-utils/search';

//Custom Components
import LoginComponent from './LoginComponent';

function TimeSelectExample(props) {
    //State variables for communication with Splunkd

    const queryParams = new URLSearchParams(window.location.search);

    const [sessionKey, setSessionKey] = useState('<Token>');
    const [username, setUsername] = useState(queryParams.get('username'));
    const [password, setPassword] = useState(queryParams.get('password'));
    const [serverURL, setServerURL] = useState(queryParams.get('serverURL'));

    const headers = {
        headers: {
            Authorization: `Splunk ${sessionKey}`,
        },
    };

    /* Second Visualization Variables */
    //Sid for Column Chart
    const [columnSid, setColumnSid] = useState();
    //Search for Column Chart
    const [splunkSearchColumn, setSplunkSearchColumn] = useState(
        'search index=_internal | timechart count '
    );
    const [splunkSearchColumnEarliest, setSplunkSearchColumnEarliest] = useState('-24h');
    const [splunkSearchColumnLatest, setSplunkSearchColumnLatest] = useState('now');

    const [columnSearching, setColumnSearching] = useState(false);

    //Fields for Column Chart
    const [columnSearchResultsFields, setColumnSearchResultsFields] = useState();
    //Columns for Column Chart
    const [columnSearchResultsColumns, setColumnSearchResultsColumns] = useState();

    const [staticcolumnSearchResultsColumns, setStaticColumnSearchResultsColumns] = useState();

    //Seconds to Complete for Column Chart
    const [columnSecondsToComplete, setColumnSecondsToComplete] = useState();
    const [columnSearchOptions, setColumnSearchOptions] = useState({
        earliest: splunkSearchColumnEarliest,
        latest: splunkSearchColumnLatest,
        search: splunkSearchColumn,
        timePickerPresets: presets,
        timePickerFormInputTypes: formInputTypes,
        timePickerAdvancedInputTypes: [],
    });
    const [columnSearchObj, setColumnSearchObj] = useState({
        search: '',
        earliest: '',
        latest: '',
    });
    const [lineViz, setLineViz] = useState([]);

    const [selectedTime, setSelectedTime] = useState();
    /* Second Visualization Post Process Variables */

    //Sid for Single Value
    //Search for Single Value

    //Timer for Search length
    const timer = (ms) => new Promise((res) => setTimeout(res, ms));
    async function load(sidJob, completeFunc, fieldsFunc, columnsFunc, setSearchingBool, type) {
        var completeSeconds = 0;
        for (var i = 0; i < 30; i++) {
            fetchData(sidJob, fieldsFunc, columnsFunc, type)
                .then((data) => data)
                .then((sidJob) => {
                    if (sidJob) {
                        completeSeconds = completeSeconds + 1;
                        setSearchingBool(false);
                        completeFunc(completeSeconds);
                    }
                });
            if (!completeSeconds) {
                await timer(1000);
            } else {
                break;
            }
        }
    }

    const createJob = async (search, earliest, latest) => {
        const n = createSearchJob(
            {
                search: search,
                earliest_time: earliest,
                latest_time: latest,
            },
            {},
            { splunkdPath: serverURL, app: 'search', owner: username },
            headers
        )
            .then((response) => response)
            .then((data) => data.sid);
        return n;
    };

    const fetchData = async (sidJob, fieldsFunc, columnsFunc, type) => {
        const n = await getData(
            sidJob,
            'results',
            { output_mode: 'json_cols' },
            { splunkdPath: serverURL, app: 'search', owner: username },
            headers
        )
            .then((response) => response)
            .then((data) => {
                if (data) {
                    fieldsFunc(data.fields);
                    columnsFunc(data.columns);
                    setStaticColumnSearchResultsColumns(data.columns);

                    if (type == 'Line') {
                        setLineViz([
                            <Line
                                options={{}}
                                dataSources={{
                                    primary: {
                                        data: {
                                            fields: data.fields,
                                            columns: data.columns,
                                        },
                                        meta: {},
                                    },
                                }}
                            />,
                        ]);
                    }
                    return data;
                }
            });
        return n;
    };

    const handleOptionsChange = async (option, setSearchOptions, searchOptions) => {
        setSearchOptions({
            ...searchOptions,
            ...option,
        });
    };

    const selectTime = (e, { value }) => {
        setSelectedTime(value);

        var time = new Date(value);
        const filterByExpiration = (arr) => {
            var x = 0;
            for (var item in arr[0]) {
                var currDate = new Date(item[0]);

                if (currDate < time) {
                    arr[0].splice(x, 1);
                    arr[1].splice(x, 1);
                    arr[2].splice(x, 1);
                }
                x = x + 1;
            }

            return arr;
        };

        var newCols = filterByExpiration(staticcolumnSearchResultsColumns);

        setLineViz([
            <Line
                options={{}}
                dataSources={{
                    primary: {
                        data: {
                            fields: columnSearchResultsFields,
                            columns: newCols,
                        },
                        meta: {},
                    },
                }}
            />,
        ]);
    };

    /**
     * Invoked when the user hits enter or click on the search button
     */
    const handleEventTrigger = async (
        eventType,
        Sid,
        setSidFunc,
        setSearchObjFunction,
        searchObj,
        setSecondsToComplete,
        setSearchResultsFields,
        setSearchResultsColumns,
        setSearchingBool,
        setOptionsFunc,
        searchOptions,
        type
    ) => {
        setSearchObjFunction({
            search: searchOptions.search,
            earliest: searchOptions.earliest,
            latest: searchOptions.latest,
        });
        switch (eventType) {
            case 'submit':
                setSearchingBool(true);
                createJob(searchOptions.search, searchOptions.earliest, searchOptions.latest)
                    .then((data) => data)
                    .then((sidJob) => {
                        setSidFunc(sidJob);
                        load(
                            sidJob,
                            setSecondsToComplete,
                            setSearchResultsFields,
                            setSearchResultsColumns,
                            setSearchingBool,
                            type
                        );
                    });

                break;
            case 'escape':
                this.handleOptionsChange({ search: '' }, setOptionsFunc, searchOptions);
                break;
            default:
                break;
        }
    };

    const wordBreakStyle = { overflowWrap: 'break-word', margin: '10px' };
    return (
        <div className="App">
            <header className="App-header">
                {sessionKey == '<Token>' ? (
                    <>
                        <Heading level={2}>Setup Instructions</Heading>
                        <P>
                            Note: You may need to complete a step for this app to work with your
                            Splunk Environment. Details below:
                        </P>
                        <List>
                            <List.Item>
                                You'll need to configure CORS on your Splunk Environment.
                                Instructions can be found{' '}
                                <Link to="https://dev.splunk.com/enterprise/docs/developapps/visualizedata/usesplunkjsstack/communicatesplunkserver/">
                                    here
                                </Link>
                            </List.Item>
                            <List.Item>
                                You'll need to have a trusted certificate for the Splunk management
                                port. If you don't have a valid certificate, you can always visit
                                the URL for the management port of your Splunk environment, and
                                trust the certificate manually with your browser.
                            </List.Item>
                        </List>
                    </>
                ) : (
                    <></>
                )}

                {sessionKey == '<Token>' ? (
                    <>
                        <LoginComponent
                            username={username}
                            setUsername={setUsername}
                            password={password}
                            setPassword={setPassword}
                            serverURL={serverURL}
                            setServerURL={setServerURL}
                            sessionKey={sessionKey}
                            setSessionKey={setSessionKey}
                        ></LoginComponent>
                    </>
                ) : (
                    <div style={{ width: '100%' }}>
                        <div style={{ float: 'right', width: '100%', padding: '10px' }}>
                            <Heading style={wordBreakStyle} level={3}>
                                This is a Line Chart that is populated by the following search:{' '}
                            </Heading>
                            <div style={{ padding: '10px' }}>
                                <SearchBar
                                    options={columnSearchOptions}
                                    onOptionsChange={(options) =>
                                        handleOptionsChange(
                                            options,
                                            setColumnSearchOptions,
                                            columnSearchOptions
                                        )
                                    }
                                    onEventTrigger={(eventType) =>
                                        handleEventTrigger(
                                            eventType,
                                            columnSid,
                                            setColumnSid,
                                            setColumnSearchObj,
                                            columnSearchObj,
                                            setColumnSecondsToComplete,
                                            setColumnSearchResultsFields,
                                            setColumnSearchResultsColumns,
                                            setColumnSearching,
                                            setColumnSearchOptions,
                                            columnSearchOptions,
                                            'Line'
                                        )
                                    }
                                />
                            </div>
                            {columnSearching ? <WaitSpinner size="medium" /> : <></>}

                            {columnSecondsToComplete ? (
                                <div style={{ align: 'center', padding: '40px' }}>
                                    <h3>Show Only Values Before: </h3>
                                    <Select style={{ width: 200 }} onChange={selectTime}>
                                        {staticcolumnSearchResultsColumns[0].map((key, value) => {
                                            return (
                                                <Select.Option
                                                    label={key}
                                                    value={key}
                                                ></Select.Option>
                                            );
                                        })}
                                    </Select>
                                    <div style={{ margin: '20px' }}></div>
                                    {lineViz.map((key, value) => {
                                        return key;
                                    })}
                                </div>
                            ) : (
                                <></>
                            )}
                        </div>
                    </div>
                )}
            </header>
        </div>
    );
}

export default TimeSelectExample;
