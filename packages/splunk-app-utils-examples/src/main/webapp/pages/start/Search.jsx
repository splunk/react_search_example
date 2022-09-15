import Heading from '@splunk/react-ui/Heading';
import React, { useState, useEffect } from 'react';
import {
    validateSearch,
    batchGetSearches,
    getData,
    postAction,
    oneShot,
    createSearchJob,
    getCachedSearch,
    stripLeadingSearchCommand,
    addLeadingSearchCommand,
    createJava5HashForString,
} from '@splunk/splunk-utils/search';
import JSONTree from '@splunk/react-ui/JSONTree';
import P from '@splunk/react-ui/Paragraph';

function Search() {
    const [getValidResults, setValidResults] = useState({});
    const [createSearchJobSid, setCreateSearchJobSid] = useState('');
    const [createSecondSearchJobSid, setCreateSecondSearchJobSid] = useState('');

    const [oneShotResults, setOneShotResults] = useState({});

    const [cachedSearchResults, setCachedSearchResults] = useState({});

    const [searchBool, setSearchingBool] = useState(false);
    const [searchResultsFields, setSearchResultsFields] = useState();
    const [searchResultsColumns, setSearchResultsColumns] = useState();
    const [secondsToComplete, setSecondsToComplete] = useState(0);
    const [batchSearchResults, setBatchSearchResults] = useState({ entry: [] });

    const timer = (ms) => new Promise((res) => setTimeout(res, ms));

    const [search] = useState('search index=_internal | stats count');

    useEffect(() => {
        //Example of validating a search
        validateSearch(search).then((result) => setValidResults(result));

        //Example of Creating a Search Job
        createSearchJob({
            search: search,
            earliest_time: '-1h',
            latest_time: 'now',
        })
            .then((response) => response)
            .then((data) => {
                if (data.sid != '') {
                    setCreateSearchJobSid(data.sid);
                }
            });

        //This is just a Secondary Search we use for the batchGetSearches example
        createSearchJob({
            search: 'search index=_internal | stats count by sourcetype | eval search="Second Search"',
            earliest_time: '-1h',
            latest_time: 'now',
        })
            .then((response) => response)
            .then((data) => {
                if (data.sid != '') {
                    setCreateSecondSearchJobSid(data.sid);
                }
            });

        createSearchJob({
            search: 'search index=_internal | stats count by sourcetype | eval search="Cached Search"',
            earliest_time: '-15m',
            latest_time: 'now',
            label: 'Cached Search Example',
        })
            .then((response) => response)
            .then((data) => {
                if (data.sid != '') {
                    setCreateSecondSearchJobSid(data.sid);
                }
            });

        oneShot({
            search: 'search index=_internal | stats count by sourcetype | eval search="One Shot results"',
            earliest_time: '-1h',
            latest_time: 'now',
        })
            .then((response) => response)
            .then((data) => {
                setOneShotResults(data);
            });
    }, []);

    useEffect(() => {
        if (createSecondSearchJobSid != '' && createSearchJobSid != '') {
            batchGetSearches([createSearchJobSid, createSecondSearchJobSid]).then((data) => {
                setBatchSearchResults(data);
            });
        }
    }, [createSearchJobSid, createSecondSearchJobSid]);

    function getCachedSearchResults() {
        getCachedSearch(
            {
                search: 'search index=_internal | stats count by sourcetype | eval search="Cached Search"',
                earliest_time: '-15m',
                latest_time: 'now',
                label: 'Cached Search Example',
            },
            { cacheLimit: 0 }
        ).then((searchState) => {
            setCachedSearchResults(searchState);
            console.log(searchState);
        });
    }

    useEffect(() => {
        if (createSearchJobSid != '') {
            load(
                createSearchJobSid,
                setSecondsToComplete,
                setSearchResultsFields,
                setSearchResultsColumns,
                setSearchingBool
            );
        }
    }, [createSearchJobSid]);

    async function load(sidJob, completeFunc, fieldsFunc, columnsFunc, setSearchingBool, type) {
        var completeSeconds = 0;
        for (var i = 0; i < 30; i++) {
            if (!searchBool) {
                fetchData(sidJob, fieldsFunc, columnsFunc, type)
                    .then((data) => {
                        return data;
                    })
                    .then((sidJob) => {
                        if (sidJob) {
                            completeSeconds = completeSeconds + 1;
                            setSearchingBool(true);
                            completeFunc(completeSeconds);
                        }
                    });
                if (!completeSeconds) {
                    await timer(1000);
                } else {
                    break;
                }
            } else {
                break;
            }
        }
    }

    const fetchData = async (sidJob, fieldsFunc, columnsFunc) => {
        //Example of Getting Data from Sid
        const n = await getData(sidJob, 'results', { output_mode: 'json_cols' })
            .then((response) => response)
            .then((data) => {
                if (data) {
                    fieldsFunc(data.fields);
                    columnsFunc(data.columns);
                }
                return true;
            });

        return n;
    };

    async function extendTTL() {
        postAction(createSearchJobSid, { action: 'save' }).then((response) => {
            batchGetSearches([createSearchJobSid, createSecondSearchJobSid]).then((data) => {
                setBatchSearchResults(data);
            });
        });
        postAction(createSecondSearchJobSid, { action: 'save' }).then((response) => {
            batchGetSearches([createSearchJobSid, createSecondSearchJobSid]).then((data) => {
                setBatchSearchResults(data);
            });
        });
    }

    return (
        <div style={{ vericalAlign: 'top' }}>
            <Heading level={1}>Search</Heading>
            <hr />
            <Heading level={3}>Add a Leading Search Command</Heading>
            <P>{addLeadingSearchCommand('index=_internal')}</P>
            <Heading level={3}>Validate a Splunk Search</Heading>
            <JSONTree json={getValidResults}></JSONTree>
            <Heading level={3}>Create Java Hash for String</Heading>
            <P>{createJava5HashForString('index=_internal')}</P>
            <Heading level={3}>Strip a Leading Search Command</Heading>
            <P>{stripLeadingSearchCommand(search)}</P>
            <Heading level={3}>Create a Search Job</Heading>
            <P>Sid: {createSearchJobSid}</P>
            <Heading level={3}>Get Results from Search Job</Heading>
            <P>Search Job Is Done: {String(searchBool)}</P>
            <P>Search Job Timer: {secondsToComplete}</P>
            <P>Fields: {searchResultsFields}</P>
            <P>Columns: {searchResultsColumns}</P>
            <Heading level={3}>Get Results from Multiple Search Jobs (batchGetSearches)</Heading>
            <P>Sid #1: {String(createSearchJobSid)}</P>
            <P>Sid #2: {String(createSecondSearchJobSid)}</P>
            <JSONTree json={batchSearchResults}></JSONTree>
            <P>Sid #1: {String(createSearchJobSid)}</P>
            <P>Sid #2: {String(createSecondSearchJobSid)}</P>
            <Heading level={3}>One Shot</Heading>
            <JSONTree json={oneShotResults}></JSONTree>
            <Heading level={3}>
                Extend TTL for Search Jobs using postAction:{createSecondSearchJobSid}{' '}
            </Heading>
            {batchSearchResults.entry.map((key, value) => {
                return (
                    <>
                        <P>SID: {String(key.content.sid)}</P>
                        <P>TTL: {String(key.content.ttl)}</P>
                    </>
                );
            })}
            <button onClick={(e) => extendTTL(e)}>Extend TTL for Search Jobs</button>

            <Heading level={3}>Cached Search Results</Heading>
            <JSONTree json={cachedSearchResults}></JSONTree>
            <button onClick={(e) => getCachedSearchResults(e)}>Get Cached Searches</button>
        </div>
    );
}

export default Search;
