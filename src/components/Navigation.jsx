import React, { useState, useCallback } from 'react';
import { SplunkThemeProvider } from '@splunk/themes';
import Link from '@splunk/react-ui/Link';
import Switch from '@splunk/react-ui/Switch';
import P from '@splunk/react-ui/Paragraph';

import Button from '@splunk/react-ui/Button';

function Navigation(props) {
    const [darkModeState, setDarkMode] = useState(false);

    function handleDarkModeClick(event) {
        setDarkMode((event) => !event);
        props.setDarkMode(darkModeState);
    }

    return (
        <SplunkThemeProvider family="enterprise" colorScheme={darkModeState ? 'dark' : 'light'}>
            <div
                className="navigation"
                style={
                    darkModeState ? { backgroundColor: '#ffffff' } : { backgroundColor: '#282c34' }
                }
            >
                <nav className="navbar navbar-expand navbar-dark bg-dark">
                    <div className="container">
                        <div style={{ textAlign: 'center', padding: '20px' }}>
                            <Link
                                className="nav-link"
                                to="/"
                                style={{ textAlign: 'center', padding: '20px' }}
                            >
                                Home
                            </Link>
                            <Link
                                className="nav-link"
                                to="/timeselect"
                                style={{ textAlign: 'center', padding: '20px' }}
                            >
                                Timeselect
                            </Link>
                            <Button
                                label="Splunk UI Docs"
                                to="https://splunkui.splunk.com"
                                target="_blank"
                            ></Button>
                            <Switch
                                value={false}
                                onClick={(event) => handleDarkModeClick(event)}
                                selected={darkModeState}
                                appearance="toggle"
                                error={!darkModeState}
                            ></Switch>
                            <SplunkThemeProvider
                                family="enterprise"
                                colorScheme={!darkModeState ? 'dark' : 'light'}
                            >
                                <P>Dark Mode</P>
                            </SplunkThemeProvider>
                        </div>
                    </div>
                </nav>
            </div>
        </SplunkThemeProvider>
    );
}

export default Navigation;
