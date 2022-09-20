import Heading from '@splunk/react-ui/Heading';
import React from 'react';
import { createURL, createStaticURL, createRESTURL } from '@splunk/splunk-utils/url';

function URL() {
    return (
        <div style={{ vericalAlign: 'top' }}>
            <Heading level={1}>URL</Heading>
            <hr />
            <Heading level={3}>Create a URL for Search Jobs:</Heading>

            <Heading level={1}>{createURL('app/search/job')}</Heading>

            <Heading level={3}>Create a URL to a JS File in your App:</Heading>

            <Heading level={1}>{createStaticURL('static/app/search/js/foo.js')}</Heading>

            <Heading level={3}>Create a REST URL to query All Saved Searches:</Heading>

            <Heading level={1}>{createRESTURL('saved/searches')}</Heading>

            <Heading level={3}>
                Create a REST URL to query Saved Searches inside of the Search App:
            </Heading>

            <Heading level={1}>{createRESTURL('saved/searches', { app: 'search' })}</Heading>
        </div>
    );
}

export default URL;
