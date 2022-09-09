import React, { useState } from 'react';
import { SplunkThemeProvider } from '@splunk/themes';
import Link from '@splunk/react-ui/Link';
import Switch from '@splunk/react-ui/Switch';
import P from '@splunk/react-ui/Paragraph';

import Button from '@splunk/react-ui/Button';

function Layout(props) {
    const [darkModeState, setDarkMode] = useState(false);
    const [selectedComponent, setSelectedComponent] = useState(<></>);

    function handleDarkModeClick(event) {
        setDarkMode((event) => !event);
        props.setDarkMode((event) => !event);
    }

    function switchTimeSelect(e) {
        e.preventDefault();
        setSelectedComponent(<h1>It worked</h1>);
    }
    return (
        <SplunkThemeProvider family="enterprise" colorScheme={!darkModeState ? 'light' : 'dark'}>
            <div
                className="navigation"
                style={
                    !darkModeState ? { backgroundColor: '#ffffff' } : { backgroundColor: '#282c34' }
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
                                onClick={(e) => switchTimeSelect(e)}
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
                                value={true}
                                onClick={(event) => handleDarkModeClick(event)}
                                selected={darkModeState}
                                appearance="toggle"
                                error={!darkModeState}
                            ></Switch>

                            <P>Dark Mode</P>
                        </div>
                    </div>
                </nav>
            </div>
            {selectedComponent}
        </SplunkThemeProvider>
    );
}

export default Layout;
