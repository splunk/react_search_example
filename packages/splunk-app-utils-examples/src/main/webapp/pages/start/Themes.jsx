import Heading from '@splunk/react-ui/Heading';
import React from 'react';
import { getUserTheme } from '@splunk/splunk-utils/themes';

function Themes(props) {
    console.log(props.darkMode);
    return (
        <div style={{ vericalAlign: 'top' }}>
            <Heading level={3}>User Theme:</Heading>

            <Heading level={1}>{getUserTheme()}</Heading>
        </div>
    );
}

export default Themes;
