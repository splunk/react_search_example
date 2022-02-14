import './App.css';
import { createSearchJob, getData } from '@splunk/splunk-utils/search';
import { isAvailable as splunkwebIsAvailable } from '@splunk/splunk-utils/config';
import fetchSearchBNFs from '@splunk/react-search/utils/searchBNFs';

import { useState, useEffect } from 'react'

import SingleValue from '@splunk/visualizations/SingleValue';
import Column from '@splunk/visualizations/Column';

import Link from '@splunk/react-ui/Link'
import List from '@splunk/react-ui/List'
import P from '@splunk/react-ui/Paragraph';
import Button from '@splunk/react-ui/Button';
import WaitSpinner from '@splunk/react-ui/WaitSpinner';
import Heading from '@splunk/react-ui/Heading';
import { presets, formInputTypes } from './constants';
import SearchBar from '@splunk/react-search/components/Bar';


function App() {


  //Sid for Column Chart
  const [columnSid, setColumnSid] = useState()
  //Search for Column Chart
  const [splunkSearchColumn, setSplunkSearchColumn] = useState("search index=_* | stats count by sourcetype | eval count=random()%200 | fields sourcetype count")
  const [splunkSearchColumnEarliest, setSplunkSearchColumnEarliest] = useState('-24h')
  const [splunkSearchColumnLatest, setSplunkSearchColumnLatest] = useState('now')

  const splunkSearchColumnPostProcess = "| search sourcetype=\"splunk*\" OR sourcetype=\"*scheduler*\" | sort 0 - count"

  const [columnSearching, setColumnSearching] = useState(false)

  //Fields for Column Chart
  const [columnSearchResultsFields, setColumnSearchResultsFields] = useState()
  //Columns for Column Chart
  const [columnSearchResultsColumns, setColumnSearchResultsColumns] = useState()
  //Seconds to Complete for Column Chart
  const [columnSecondsToComplete, setColumnSecondsToComplete] = useState()
  const [columnSearchOptions, setColumnSearchOptions] = useState({
    earliest: splunkSearchColumnEarliest,
    latest: splunkSearchColumnLatest,
    search: splunkSearchColumn,
    timePickerPresets: presets,
    timePickerFormInputTypes: formInputTypes,
    timePickerAdvancedInputTypes: [],
  })
  const [columnSearchObj, setColumnSearchObj] = useState({
    search: '',
    earliest: '',
    latest: ''
  })



  //Sid for Single Value
  const [singleValueSid, setSingleValueSid] = useState()
  //Search for Single Value
  const [splunkSearchSingleValue, setSplunkSearchSingleValue] = useState("search index=_internal | stats count by sourcetype")
  const [splunkSearchSingleValueEarliest, setSplunkSearchSingleValueEarliest] = useState('-24h')
  const [splunkSearchSingleValueLatest, setSplunkSearchSingleValueLatest] = useState('now')

  const splunkSingleValuePostProcess = "| search sourcetype=\"splunkd\""

  const [singleValueSearching, setSingleValueSearching] = useState(false)

  //Fields for Single Value
  const [singleValueSearchResultsFields, setSingleValueSearchResultsFields] = useState()
  //Columns for Single Value
  const [singleValueSearchResultsColumns, setSingleValueSearchResultsColumns] = useState()
  //Seconds to Complete for Single Value
  const [singleValueSeondsToComplete, setSingleValueSecondsToComplete] = useState()

  const [singleValueSearchOptions, setSingleValueSearchOptions] = useState({
    earliest: splunkSearchSingleValueEarliest,
    latest: splunkSearchSingleValueLatest,
    search: splunkSearchSingleValue,
    timePickerPresets: presets,
    timePickerFormInputTypes: formInputTypes,
    timePickerAdvancedInputTypes: [],
  })
  const [singleValueSearchObj, setSingleValueSearchObj] = useState({
    search: '',
    earliest: '',
    latest: ''
  })



  //Session Key for Authorization
  const sessionKey = "eyJraWQiOiJzcGx1bmsuc2VjcmV0IiwiYWxnIjoiSFM1MTIiLCJ2ZXIiOiJ2MiIsInR0eXAiOiJzdGF0aWMifQ.eyJpc3MiOiJhZG1pbiBmcm9tIEMwMldSMUg0SFRERCIsInN1YiI6ImFkbWluIiwiYXVkIjoidGVzdGluZyBzdWkiLCJpZHAiOiJTcGx1bmsiLCJqdGkiOiI5ZmUxMWYzZWMzODljYmU5NWJkNmE0NjY2YWYwMjhiNGRjMGM5NTQxNjdiYjg1ZGFlOTY4MmVlZTMzMWQ2YTQ1IiwiaWF0IjoxNjQ0ODQ4MTIyLCJleHAiOjE2NjA0MDAxMjIsIm5iciI6MTY0NDg0ODEyMn0.BTC-XYrdFnn5_t3RKWtDCrTgKe4D3XHVQ7gWtboOUGBMWJGGmvt5u0m5lNr61puBdtjFUprfVn6NLohZfvxpyA"
  //URL for Authorization
  const splunkURL = "https://localhost:8089"
  //Headers for Authorization
  const headers = {
    headers: {
      Authorization: `Splunk ${sessionKey}`,
    }
  }

  //Timer for Search length
  const timer = ms => new Promise(res => setTimeout(res, ms))

  useEffect(() => {


  }, [])

  async function load(sidJob, completeFunc, fieldsFunc, columnsFunc, setSearchingBool) {
    var completeSeconds = 0

    for (var i = 0; i < 30; i++) {
      fetchData(sidJob, fieldsFunc, columnsFunc)
        .then(data => data)
        .then(sidJob => {
          if (sidJob) {
            completeSeconds = completeSeconds + 1
            setSearchingBool(false)
            completeFunc(completeSeconds)
          }
        })
      if (!completeSeconds) {
        await timer(1000);
      }
      else {
        break
      }
    }
  }

  function handlePostProcessClick(locaPostProcessSid, postProcessSearch, setFields, setColumns) {
    postProcess(locaPostProcessSid, postProcessSearch, setFields, setColumns)
  }

  const createJob = async (search, earliest, latest) => {
    console.log(search)
    const n = createSearchJob({
      search: search,
      earliest_time: earliest,
      latest_time: latest,
    }, {}, { splunkdPath: splunkURL, app: "search", owner: "admin" }, headers)
      .then(response => response)
      .then(data => data.sid
      )
    return n
  };

  const fetchData = async (sidJob, fieldsFunc, columnsFunc) => {
    const n = await getData(sidJob, "results", { output_mode: "json_cols" }, { splunkdPath: splunkURL, app: "search", owner: "admin" }, headers)
      .then(response => response)
      .then(data => {
        if (data) {
          fieldsFunc(data.fields)
          columnsFunc(data.columns)
          return data
        }
      })
    return n
  };

  const postProcess = async (sidJob, postProcess, fieldsFunc, columnsFunc) => {
    const n = await getData(sidJob, "results", { output_mode: "json_cols", "search": postProcess }, { splunkdPath: splunkURL, app: "search", owner: "admin" }, headers)
      .then(response => response)
      .then(data => {
        if (data) {
          fieldsFunc(data.fields)
          columnsFunc(data.columns)
          return data
        }
      })
    return n
  };

  const handleOptionsChange = async (option, setSearchOptions, searchOptions) => {
    console.log(searchOptions)
    setSearchOptions(
      {...searchOptions,
       ...option})
  };

  /**
   * Invoked when the user hits enter or click on the search button
   */
  const handleEventTrigger = async (eventType, Sid, setSidFunc, setSearchObjFunction, searchObj, setSecondsToComplete, setSearchResultsFields, setSearchResultsColumns, setSearchingBool, setOptionsFunc, searchOptions) => {
    setSearchObjFunction({
      search: searchOptions.search,
      earliest: searchOptions.earliest,
      latest: searchOptions.latest
    })
    switch (eventType) {
      case 'submit':
          setSearchingBool(true)
          createJob(searchOptions.search, searchOptions.earliest, searchOptions.latest)
            .then(data => data)
            .then(sidJob => {
              setSidFunc(sidJob)
              load(sidJob, setSecondsToComplete, setSearchResultsFields, setSearchResultsColumns, setSearchingBool)
            })
        
        break;
      case 'escape':
        this.handleOptionsChange({ search: '' }, setOptionsFunc, searchOptions);
        break;
      default:
        break;
    }
  };

  const wordBreakStyle = { overflowWrap: "break-word", margin: "10px" }
  return (
    <div className="App">
      <header className="App-header">

        <Heading level={1}>@splunk/splunk-utils Example app</Heading>
        <P>This app will show you how to query Splunk from a remote webapp using our Splunk UI Toolkit in React. It uses a couple of packages listed below: </P>
        <List>
          <List.Item><Link to="https://www.npmjs.com/package/@splunk/splunk-utils">@splunk/splunk-utils</Link></List.Item>
          <ul><li><Link to="https://splunkui.splunkeng.com/Packages/splunk-utils">Documentation</Link></li></ul>
          <List.Item><Link to="https://www.npmjs.com/package/@splunk/visualizations">@splunk/visualizations</Link></List.Item>
          <ul><li><Link to="https://splunkui.splunkeng.com/Packages/visualizations">Documentation</Link></li></ul>
          <List.Item><Link to="https://www.npmjs.com/package/@splunk/react-ui">@splunk/react-ui</Link></List.Item>
          <ul><li><Link to="https://splunkui.splunkeng.com/Packages/react-ui">Documentation</Link></li></ul>
        </List>

        <Heading level={2}>Setup Instructions</Heading>
        <P>You'll need to complete a couple of setup steps for this app to work with your Splunk Environment.</P>
        <List>
          <List.Item>Setup your own Authentication Token to use inside of this app. Replace that token you create with the sessionKey inside of this file. Instructions can be found <Link to="https://docs.splunk.com/Documentation/Splunk/8.2.3/Security/CreateAuthTokens">here</Link></List.Item>
          <List.Item>You'll need to configure CORS on your Splunk Environment. Instructions can be found <Link to="https://dev.splunk.com/enterprise/docs/developapps/visualizedata/usesplunkjsstack/communicatesplunkserver/">here</Link></List.Item>
        </List>

        {sessionKey == "<Token>" ? <Heading level={1}>Please set your authorization token</Heading> :

          <div style={{ width: "100%" }}>
            <div style={{ float: "left", width: "50%" }}>
              <SingleValue
                options={{
                  majorColor: '#008000',
                  sparklineDisplay: "off",
                  trendDisplay: "off"
                }}
                dataSources={{
                  primary: {
                    data: {
                      columns: singleValueSearchResultsColumns,
                      fields: singleValueSearchResultsFields
                    },
                    meta: {},
                  },
                }}
              />

              <Heading style={wordBreakStyle} level={3}>This is a Single Value that is populated by the following search: </Heading>
              <SearchBar
                options={singleValueSearchOptions}
                onOptionsChange={(options) => handleOptionsChange(options, setSingleValueSearchOptions, singleValueSearchOptions)}
                onEventTrigger={(eventType) => handleEventTrigger(eventType, singleValueSid, setSingleValueSid, setSingleValueSearchObj, singleValueSearchObj, setSingleValueSecondsToComplete, setSingleValueSearchResultsFields, setSingleValueSearchResultsColumns, setSingleValueSearching, setSingleValueSearchOptions, singleValueSearchOptions)}
              />

              {singleValueSearching ? <WaitSpinner size="medium" /> : <></>}

              {singleValueSeondsToComplete ? <>
                <Heading style={wordBreakStyle} level={3}>Clicking this button will execute the following post-process search: </Heading>
                <Heading style={wordBreakStyle} level={4}>&nbsp;&nbsp;&nbsp;&nbsp;{splunkSingleValuePostProcess}</Heading>

                <Button label="Execute Post-process" appearance="primary" onClick={() => handlePostProcessClick(singleValueSid, splunkSingleValuePostProcess, setSingleValueSearchResultsFields, setSingleValueSearchResultsColumns)} />
                <P style={wordBreakStyle}>
                  Search: {singleValueSearchOptions.search}
                </P>
                <P style={wordBreakStyle}>

                  {"Splunk SID: " + singleValueSid}
                </P>
                <P style={wordBreakStyle}>
                  {"Seconds to Complete: " + JSON.stringify(singleValueSeondsToComplete)}
                </P>
                <P style={wordBreakStyle}>
                  {"Splunk Results - Fields: " + JSON.stringify(singleValueSearchResultsFields)}
                </P>
                <P style={wordBreakStyle}>
                  {"Splunk Results - Columns: " + JSON.stringify(singleValueSearchResultsColumns)}
                </P>
              </> : <></>}

            </div>

            <div style={{ float: "right", width: "50%" }}>
              <Column
                options={{}}
                dataSources={{
                  primary: {

                    data: {
                      fields: columnSearchResultsFields,
                      columns: columnSearchResultsColumns,
                    },
                    meta: {},
                  },
                }}
              />
              <Heading style={wordBreakStyle} level={3}>This is a Column Chart that is populated by the following search: </Heading>
              <SearchBar
                options={columnSearchOptions}
                onOptionsChange={(options) => handleOptionsChange(options, setColumnSearchOptions, columnSearchOptions)}
                onEventTrigger={(eventType) => handleEventTrigger(eventType, columnSid, setColumnSid, setColumnSearchObj, columnSearchObj, setColumnSecondsToComplete, setColumnSearchResultsFields, setColumnSearchResultsColumns, setColumnSearching, setColumnSearchOptions, columnSearchOptions)}
              />

              {columnSearching ? <WaitSpinner size="medium" /> : <></>}

              {columnSecondsToComplete ? <>
                <Heading style={wordBreakStyle} level={3}>Clicking this button will execute the following post-process search: </Heading>
                <Heading style={wordBreakStyle} level={4}>&nbsp;&nbsp;&nbsp;&nbsp;{splunkSearchColumnPostProcess}</Heading>

                <Button label="Execute Post-process" appearance="primary" onClick={() => handlePostProcessClick(columnSid, splunkSearchColumnPostProcess, setColumnSearchResultsFields, setColumnSearchResultsColumns)} />

                <P style={wordBreakStyle}>
                  Search: {columnSearchOptions.search}
                </P>
                <P>

                  {"Splunk SID: " + columnSid}
                </P>
                <P style={wordBreakStyle}>
                  {"Seconds to Complete: " + JSON.stringify(columnSecondsToComplete)}
                </P>
                <P style={wordBreakStyle}>
                  {"Splunk Results - Fields: " + JSON.stringify(columnSearchResultsFields)}
                </P>
                <P style={wordBreakStyle}>
                  {"Splunk Results - Columns: " + JSON.stringify(columnSearchResultsColumns)}
                </P>
              </> : <></>
              }
            </div>
          </div>
        }
      </header>
    </div>
  );
}

export default App;
