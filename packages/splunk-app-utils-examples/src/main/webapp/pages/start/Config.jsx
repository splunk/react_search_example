import Heading from '@splunk/react-ui/Heading';
import React from 'react';

import {
    CSRFToken,
    isAvailable,
    app,
    appBuild,
    buildNumber,
    buildPushNumber,
    config,
    locale,
    portNumber,
    rootPath,
    serverTimezoneInfo,
    splunkdPath,
    username,
    versionLabel,
} from '@splunk/splunk-utils/config';
import JSONTree from '@splunk/react-ui/JSONTree';

function Config() {
    return (
        <div style={{ vericalAlign: 'top' }}>
            <Heading level={1}>Config</Heading>
            <hr />
            <Heading level={3}>Build Number:</Heading>
            <Heading level={1}>{String(buildNumber)}</Heading>
            <hr />
            <Heading level={3}>Locale:</Heading>
            <Heading level={1}>{String(locale)}</Heading>
            <hr />
            <Heading level={3}>CSRFToken:</Heading>
            <Heading level={1}>{String(CSRFToken)}</Heading>
            <hr />
            <Heading level={3}>Is Available:</Heading>
            <Heading level={1}>{String(isAvailable)}</Heading>
            <hr />
            <Heading level={3}>App:</Heading>
            <Heading level={1}>{String(app)}</Heading>
            <hr />
            <Heading level={3}>appBuild:</Heading>
            <Heading level={1}>{String(appBuild)}</Heading>
            <hr />
            <Heading level={3}>buildPushNumber:</Heading>
            <Heading level={1}>{String(buildPushNumber)}</Heading>
            <hr />
            <Heading level={3}>config:</Heading>
            <JSONTree json={config} expandChildren />
            <hr />
            <Heading level={3}>Port Number:</Heading>
            <Heading level={1}>{String(portNumber)}</Heading>
            <hr />
            <Heading level={3}>Root Path:</Heading>
            <Heading level={1}>{String(rootPath)}</Heading>
            <hr />
            <Heading level={3}>Server Timezone Info:</Heading>
            <Heading level={1}>{String(serverTimezoneInfo)}</Heading>
            <hr />
            <Heading level={3}>Splunkd Path:</Heading>
            <Heading level={1}>{String(splunkdPath)}</Heading>
            <hr />
            <Heading level={3}>Username:</Heading>
            <Heading level={1}>{String(username)}</Heading>
            <hr />
            <Heading level={3}>Version:</Heading>
            <Heading level={1}>{String(versionLabel)}</Heading>
        </div>
    );
}

export default Config;
