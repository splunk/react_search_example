import Heading from '@splunk/react-ui/Heading';
import React, { useState, useEffect } from 'react';
import JSONTree from '@splunk/react-ui/JSONTree';
import querystring from 'querystring';
import { createRESTURL } from '@splunk/splunk-utils/url';
import P from '@splunk/react-ui/Paragraph';

import {
    defaultFetchInit,
    findErrorMessage,
    handleResponse,
    handleError,
} from '@splunk/splunk-utils/fetch';

function Fetch(props) {
    const [foundErrorResult, setFoundError] = useState('None');
    const [validSearch, setValidSearch] = useState({ valid: 'unknown' });

    useEffect(() => {
        async function parseSearch() {
            const qs = querystring.encode({
                output_mode: 'json',
                parse_only: true,
                q: 'search index=_internal earliest=-15m || stats count',
            });
            await fetch(`${createRESTURL('search/parser')}?${search}`, defaultFetchInit)
                .then(handleResponse(200))
                .then((data) => {
                    setValidSearch({ valid: true, data });
                    return { valid: true, data };
                })
                .catch((res) =>
                    res.json().then((data) => {
                        const defaultError = 'Failed to validate search string.';
                        const foundError = findErrorMessage(data);
                        if (foundError) {
                            setFoundError(foundError.text);
                        } else {
                            setFoundError(defaultError);
                        }
                        const errorMessage = foundError ? foundError.text : defaultError;
                    })
                );
        }

        parseSearch(qs);
    }, []);

    return (
        <div style={{ vericalAlign: 'top' }}>
            <Heading level={3}>Default Fetch Headers</Heading>
            <JSONTree json={defaultFetchInit}></JSONTree>
            <Heading level={3}>Example of findErrorMessage function:</Heading>
            <P>
                Please note, this panel is intended to fail. If you review the example code, we
                intentionally submitted a bad search to the search parser so we could catch the
                error below.
            </P>
            <Heading level={4}>Error:</Heading>
            <P>{foundErrorResult}</P>
        </div>
    );
}

export default Fetch;
