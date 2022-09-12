import Heading from '@splunk/react-ui/Heading';
import React, { useState, useEffect } from 'react';
import { get, getLatest, getHistory, dispatch } from '@splunk/splunk-utils/savedSearch';
import { getData } from '@splunk/splunk-utils/search';
import JSONTree from '@splunk/react-ui/JSONTree';

function SavedSearch(props) {
    const [getResults, setGetResults] = useState({});
    const [getLatestResults, setGetLatestResults] = useState({});
    const [getLatestResultsJobResults, setGetLatestResultsJobResults] = useState({});
    const [getHistoryResults, setGetHistoryResults] = useState({});
    const [dispatchResults, setDispatchResults] = useState({});

    var savedSearchName = 'Errors in the last 24 hours';

    useEffect(() => {
        get({ name: savedSearchName, app: 'splunk-app-utils-examples', owner: 'nobody' }).then(
            (data) => setGetResults(data)
        );

        getLatest({
            name: savedSearchName,
            app: 'splunk-app-utils-examples',
            owner: 'nobody',
        }).then((data) => {
            setGetLatestResults(data);

            getData(data.name, 'results').then((results) => {
                console.log(results);
                setGetLatestResultsJobResults(results);
            });
        });

        getHistory({
            name: savedSearchName,
            app: 'splunk-app-utils-examples',
            owner: 'nobody',
        }).then((data) => setGetHistoryResults(data));

        dispatch({
            name: savedSearchName,
            app: 'splunk-app-utils-examples',
            owner: 'nobody',
        }).then((data) => setDispatchResults(data));
    }, []);

    return (
        <div style={{ vericalAlign: 'top' }}>
            <Heading level={3}>
                Makes a GET request to the saved/searches/{savedSearchName} REST API endpoint.
            </Heading>

            <JSONTree json={getResults}></JSONTree>

            <Heading level={3}>
                The most recent search job for the specified saved search {'['}
                {savedSearchName}
                {']'}:
            </Heading>
            <JSONTree json={getLatestResults}></JSONTree>

            <Heading level={4}>
                The most recent search job results for the specified saved search {'['}
                {savedSearchName}
                {']'}:
            </Heading>

            <JSONTree json={getLatestResultsJobResults}></JSONTree>

            <Heading level={3}>
                Get History of the Saved Search {'['}
                {savedSearchName}
                {']'}:
            </Heading>

            <JSONTree json={getHistoryResults}></JSONTree>

            <Heading level={3}>
                Dispatch the Saved Search: {'['}
                {savedSearchName}
                {']'}:
            </Heading>

            <JSONTree json={dispatchResults}></JSONTree>
        </div>
    );
}

export default SavedSearch;
