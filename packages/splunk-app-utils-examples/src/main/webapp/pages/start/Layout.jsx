import React, { useState } from 'react';
import { SplunkThemeProvider } from '@splunk/themes';
import Link from '@splunk/react-ui/Link';
import P from '@splunk/react-ui/Paragraph';
import Boolean from './Boolean';
import Button from '@splunk/react-ui/Button';
import Config from './Config';
import URL from './URL';
import Themes from './Themes';
import SavedSearch from './SavedSearch';
import Fetch from './Fetch';
function Layout() {
    const [selectedComponent, setSelectedComponent] = useState(<></>);

    function switchHome(e) {
        e.preventDefault();
        setSelectedComponent(<h1>Home</h1>);
    }
    function switchBoolean(e) {
        e.preventDefault();
        setSelectedComponent(<Boolean />);
    }

    function switchConfig(e) {
        e.preventDefault();
        setSelectedComponent(<Config />);
    }

    function switchTheme(e) {
        e.preventDefault();
        setSelectedComponent(<Themes />);
    }

    function switchURL(e) {
        e.preventDefault();
        setSelectedComponent(<URL />);
    }

    function switchSavedSearch(e) {
        e.preventDefault();
        setSelectedComponent(<SavedSearch />);
    }

    function switchFetch(e) {
        e.preventDefault();
        setSelectedComponent(<Fetch />);
    }
    return (
        <SplunkThemeProvider family="enterprise">
            <div className="navigation">
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <Link
                        className="nav-link"
                        onClick={(e) => switchHome(e)}
                        style={{ textAlign: 'center', padding: '20px' }}
                    >
                        Home
                    </Link>

                    <Link
                        className="nav-link"
                        onClick={(e) => switchBoolean(e)}
                        style={{ textAlign: 'center', padding: '20px' }}
                    >
                        Boolean
                    </Link>

                    <Link
                        className="nav-link"
                        onClick={(e) => switchConfig(e)}
                        style={{ textAlign: 'center', padding: '20px' }}
                    >
                        Config
                    </Link>
                    <Link
                        className="nav-link"
                        onClick={(e) => switchTheme(e)}
                        style={{ textAlign: 'center', padding: '20px' }}
                    >
                        Themes
                    </Link>
                    <Link
                        className="nav-link"
                        onClick={(e) => switchURL(e)}
                        style={{ textAlign: 'center', padding: '20px' }}
                    >
                        URL
                    </Link>
                    <Link
                        className="nav-link"
                        onClick={(e) => switchSavedSearch(e)}
                        style={{ textAlign: 'center', padding: '20px' }}
                    >
                        Saved Search
                    </Link>

                    <Link
                        className="nav-link"
                        onClick={(e) => switchFetch(e)}
                        style={{ textAlign: 'center', padding: '20px' }}
                    >
                        Fetch
                    </Link>
                    <Button
                        label="Splunk UI Docs"
                        to="https://splunkui.splunk.com"
                        target="_blank"
                    ></Button>
                </div>
                {selectedComponent}
            </div>
        </SplunkThemeProvider>
    );
}

export default Layout;
