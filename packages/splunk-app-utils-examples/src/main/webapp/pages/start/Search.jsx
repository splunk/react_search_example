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
} from '@splunk/splunk-utils/search';
import JSONTree from '@splunk/react-ui/JSONTree';
import P from '@splunk/react-ui/Paragraph';

function Search() {
    const [getValidResults, setValidResults] = useState({});

    useEffect(() => {
        validateSearch('search index=_internal').then((result) => setValidResults(result));
    }, []);

    return (
        <div style={{ vericalAlign: 'top' }}>
            <Heading level={1}>Search</Heading>
            <hr />
            <Heading level={3}>Add a Leading Search Command</Heading>

            <P>{addLeadingSearchCommand('index=_internal')}</P>

            <Heading level={3}>Validate a Splunk Search</Heading>

            <JSONTree json={getValidResults}></JSONTree>

            <Heading level={3}>Strip a Leading Search Command</Heading>

            <P>{stripLeadingSearchCommand('search index=_internal')}</P>
        </div>
    );
}

export default Search;
