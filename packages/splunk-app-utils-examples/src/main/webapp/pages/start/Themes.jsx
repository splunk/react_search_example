import Heading from '@splunk/react-ui/Heading';
import React, { useState } from 'react';
import { getUserTheme } from '@splunk/splunk-utils/themes';

function Themes() {
    const [theme, setTheme] = useState();

    getUserTheme().then((data) => {
        setTheme(data);
    });

    if (theme) {
        return (
            <div style={{ vericalAlign: 'top' }}>
                <Heading level={1}>Themes</Heading>
                <hr />
                <Heading level={3}>Current Theme:</Heading>
                {theme}
            </div>
        );
    } else {
        return 'Loading...';
    }
}

export default Themes;
