import { normalizeBoolean } from '@splunk/splunk-utils/boolean';
import Heading from '@splunk/react-ui/Heading';
import React from 'react';

function Boolean() {
    return (
        <div style={{ vericalAlign: 'top' }}>
            <Heading level={1}>Boolean</Heading>
            <hr />
            <Heading level={1}>{typeof 'true'}: true</Heading>

            <Heading level={1}>
                {typeof normalizeBoolean('true')}: {String(normalizeBoolean('true'))}
            </Heading>

            <hr />

            <Heading level={1}>{typeof 'false'}: false</Heading>

            <Heading level={1}>
                {typeof normalizeBoolean('false')}: {String(normalizeBoolean('false'))}
            </Heading>
        </div>
    );
}

export default Boolean;
