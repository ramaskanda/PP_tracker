import axios from "axios";
import { Col, Row, Table } from "react-bootstrap";
import {useEffect, useState, useRef} from 'react'
import Header from "../components/Header";
import HTTPService from "../constants/HTTPService";
import UrlConstants from "../constants/Urlconstants";
import { Sidebar, SidebarItem } from 'react-responsive-sidebar'
import SideNavBar from "../components/SideNavBar";
import { Autocomplete, Button, Card, CardContent, CardHeader, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';
import ErrorToast from "../components/ErrorToast";
import SuccessToast from "../components/SuccessToast";
import ConfirmDialog from "../components/ConfirmDialog";

import BootstrapTable from 'react-bootstrap-table-next';
import ToolkitProvider, {Search} from 'react-bootstrap-table2-toolkit/dist/react-bootstrap-table2-toolkit';
import paginationFactory from 'react-bootstrap-table2-paginator';

import './Users.css';
import { getTokenLocal, isLoggedInUserAdmin, isLoggedInUserOfficeUser, isLoggedInUserGenerator, isLoggedInUserBillingSupervisor, setUserIdLocal, getUserLocal } from "../constants/Common";
import { useNavigate } from "react-router";
import Loader from "../components/Loader";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider/LocalizationProvider";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import LocalStorageConstants from "../constants/LocalStorageConstants";
import { CurrencyRupee, UploadFile } from "@mui/icons-material";

const { SearchBar, ClearSearchButton } = Search;

let BillIdGolb = '';
let defaultObj = {id: 0, label: ''}
let usersGlobal = []

function Bill (){

    const [PPAs, setPPAs] = useState([])
    const [bills, setBills] = useState([])

    const [PPA, setPPA] = useState(defaultObj)

    const[BillMonth, setBillMonth] = useState(null)
    const[billDate, setBillDate] = useState(null)
    const[dueDate, setDueDate] = useState(null)
    const[BillAmount, setBillAmount] = useState(0)
    const[unitsGenerated, setUnitsGenerated] = useState(0)
    const[billRemarks, setBillRemarks] = useState("")

    const[payDate, setPayDate] = useState(null)
    const[payAmount, setPayAmount] = useState(0)
    const[payRemarks, setPayRemarks] = useState("")

    const [openPaymentDialog, setOpenPaymentDialog] = useState(false)
    const [paymentDialogTitle, setPaymentDialogTitle] = useState(false)

    const [BillDocumentName, setBillDocumentName] = useState('');
    const [base64String, setBase64String] = useState('');

    const [errorToastMessage, setErrorToastMessage] = useState(null)
    const [successToastMessage, setSuccessToastMessage] = useState(null)

    const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
    const [confirmDeleteDialogTitle, setConfirmDeleteDialogTitle] = useState("")
    const [confirmDeleteDialogContent, setConfirmDeleteDialogContent] = useState("")

    const [loader, setLoader] = useState(false)

    const scrollToRef = useRef()
    const fileRef = useRef()

    const navigate = useNavigate()

    const columns = [{
        dataField: 'index',
        text: 'Sl No.',
        headerClasses: 'text-center',
        classes: 'text-center'
      }, {
        dataField: 'billid',
        text: 'Bill Id',
        sort: true,
        headerClasses: 'text-center',
        classes: 'text-center'
      }, {
        dataField: 'month',
        text: 'Month',
        formatter: (cell, row, rowIndex) => {
            return new Date(row.month).toLocaleDateString('en-GB').split('/').slice(-2).join('-')
          },
        headerClasses: 'text-center',
        classes: 'text-center'
      },{
        dataField: 'billdate',
        text: 'Bill Date',
        sort: true,
        formatter: (cell, row, rowIndex) => {
            return new Date(row.billdate).toLocaleDateString('en-GB').split('/').join('-')
          },
        headerClasses: 'text-center',
        classes: 'text-center'
      },{
        dataField: 'billamount',
        text: 'Bill Amount',
        sort: true,
        headerClasses: 'text-center',
        classes: 'text-center'
      },{
        dataField: 'duedate',
        text: 'Due date',
        sort: true,
        formatter: (cell, row, rowIndex) => {
            return new Date(row.duedate).toLocaleDateString('en-GB').split('/').join('-')
          },
        headerClasses: 'text-center',
        classes: 'text-center'
      },{
        dataField: 'unitsgeneratedinmu',
        text: 'Units generated (MU)',
        sort: true,
        headerClasses: 'text-center',
        classes: 'text-center'
      },{
        dataField: 'billremarks',
        text: 'Bill Remarks',
        sort: true,
        headerClasses: 'text-center',
        classes: 'text-center'
      },{
        dataField: 'billfilename',
        text: 'Bill',
        sort: true,
        formatter: (cell, row, rowIndex) => {
            return <><span style={{textDecoration: 'underline', cursor:'pointer'}} onClick={() => {downloadDocument(row.ppaid, row.billid, row.billfilename)}}>{row.billfilename}</span></>
        },
        headerClasses: 'text-center',
        classes: 'text-center'
      },{
        dataField: 'paydate',
        text: 'Payment Date',
        sort: true,
        formatter: (cell, row, rowIndex) => {
            if (row.paydate){
                return new Date(row.paydate).toLocaleDateString('en-GB').split('/').join('-')
            }
            else{
                return ''
            }
          },
          headerClasses: 'text-center',
          classes: 'text-center'
      },{
        dataField: 'payamount',
        text: 'Payment Amount',
        sort: true,
        headerClasses: 'text-center',
        classes: 'text-center'
      },{
        dataField: 'payremarks',
        text: 'Payment Remarks',
        sort: true,
        headerClasses: 'text-center',
        classes: 'text-center'
      },{
        dataField: 'action',
        text: 'Action',
        formatter: (cell, row, rowIndex) => {
            return <>
                        {(isLoggedInUserAdmin() && !row.payamount) && <CurrencyRupee color="success" className="link"  onClick={() => {makePayment(row)}}></CurrencyRupee>}
                        {isLoggedInUserGenerator() && <DeleteIcon color="error" className="link" onClick={() => {deleteBill(row.billid)}}></DeleteIcon>}
                   </>
          },
          headerClasses: 'text-center',
          classes: 'text-center'
      }];

      const MySearch = (props) => {
        const [searchText, setSearchText] = useState("");
        let input;
    
        const handleClick = () => {
          props.onSearch("");
          setSearchText("");
        };
    
        const handleChange = (e) => {
          let valueArray = e.target.value.split(" ");
          let extraSpace = true;
    
          let twoSpaceRegex = /[ ]{2,}/;
          setSearchText(e.target.value.replace(twoSpaceRegex," "))
          props.onSearch(input.value);
        }

        return (
            <>
              <form>
                <div className="custom-input">
                  <input
                    id="search-bar-0"
                    className="form-control"
                    style={{ backgroundColor: "#ffffff" }}
                    ref={(n) => (input = n)}
                    type="text"
                    onChange={(e) => handleChange(e)}
                    placeholder="Filter"
                    value={searchText}
                  />
                  {/*
                  <input
                    id="input-btn-close"
                    className="btn-close"
                    type="reset"
                    value=""
                    onClick={handleClick}
                  />*/}
                </div>
              </form>
            </>
          );
    };

    const handlePaymentSubmit = () => {
        if (!payAmount || !payDate){
            return
        }
        setErrorToastMessage (null)
        setSuccessToastMessage(null)
        let url = UrlConstants.base_url + UrlConstants.Bill;
        let billDetails = bills.filter(item => item.billid == BillIdGolb)[0]
        let data = 
            {
                "BillId": BillIdGolb,
                "Month": billDetails.month.split('T')[0],
                "PpaId": billDetails.ppaid,
                "BillDate": billDetails.billdate.split('T')[0],
                "BillAmount": billDetails.billamount,
                "BillFilename": billDetails.billfilename,
                "DueDate": billDetails.duedate.split('T')[0],
                "unitsgeneratedinmu": billDetails.unitsgeneratedinmu,
                "BillRemarks": billDetails.billremarks,
                "PayDate": payDate,
                "PayAmount": payAmount,
                "PayRemarks": payRemarks,
                "IsActive": true
            }
        
        setLoader(true)
        HTTPService('POST', url, data, false, true)
        .then((res) => {
            setLoader(false)
            setSuccessToastMessage("Payment updated successfully !!")
            clearForm()
            fetchBills(PPA.id)

        }).catch ((e) => {
            if (e.response.status == 401){
                navigate("/login/sessionexpired")
                }
            setLoader(false)
            setErrorToastMessage ("Could not upload the payment. Error: " + e.response.status)
        });
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        if(event.nativeEvent.submitter.innerText.toLowerCase() === "add" || event.nativeEvent.submitter.innerText.toLowerCase() === "update"){
            setErrorToastMessage (null)
            setSuccessToastMessage(null)
            let url = UrlConstants.base_url + UrlConstants.Bill;
            let data = 
            {
                "Month": BillMonth,
                "PpaId": PPA.id,
                "BillDate": billDate,
                "BillAmount": BillAmount,
                "BillFilename": BillDocumentName,
                "DueDate": dueDate,
                "unitsgeneratedinmu": unitsGenerated,
                "BillRemarks": billRemarks,
                "PayDate": null,
                "PayAmount": null,
                "PayRemarks": "",
                "IsActive": true
            }
            
            setLoader(true)
            HTTPService('POST', url, data, false, true)
            .then((res) => {
                setLoader(false)
                setSuccessToastMessage("Bill uploaded successfully !!")
                if(base64String){
                    UploadFile(res.data.billid)
                }
                clearForm()
                fetchBills(PPA.id)
            }).catch ((e) => {
                if (e.response.status == 401){
                    navigate("/login/sessionexpired")
                  }
                setLoader(false)
                setErrorToastMessage ("Could not upload the bill. Error: " + e.response.status)
            });
        }
        else{
            clearForm()
        }
    }

    const makePayment = (row) => {
        BillIdGolb = row.billid
        setPaymentDialogTitle("Make Payment for the bill of month: " + new Date(row.month).toLocaleDateString('en-GB').split('/').slice(-2).join('-'))
        setOpenPaymentDialog(true)
    }

    const getExistingDocument = async (ppaid, billid) => {
        let url = UrlConstants.base_url + UrlConstants.Document + "?ppaid=-1&billid=" + billid;
        setLoader(true)
        try{
            const res = await HTTPService('GET', url, '', false, true)
            setLoader(false)
            return ((res.data && res.data.dt) ? res.data.dt[0] : undefined)
        } catch (e) {
            if (e.response.status == 401){
                navigate("/login/sessionexpired")
            }
            setLoader(false)
            setErrorToastMessage ("Could not fetch the documents. Error: " + e.response.status)
        }
    }
    const downloadDocument = async (ppaid, billid, fileName='downloaded_file') => {
        let response = await getExistingDocument(ppaid, billid)
        let str = (response ? response.imagebase64string : '')
        if (str.length > 0){
            const byteString = atob(str.split(',')[1]);
            const mimeString = str.split(',')[0].split(':')[1].split(';')[0];
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }
            const blob = new Blob([ab], { type: mimeString });
            
            // Create a link element, set the download attribute and trigger a click to download the file
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    const UploadFile = async (billid) => {
        setErrorToastMessage (null)
        setSuccessToastMessage(null)
        let response = await getExistingDocument(PPA.id, billid)
        let documentid = undefined
        if(response){
            documentid = response.documentid
        }
        let url = UrlConstants.base_url + UrlConstants.Document;
        let data = 
        {
            "ImageBase64String": base64String,
            "PpaId": -1,
            "BillId": billid,
            "IsPayment": true,
            "IsActive": true
        }
        
        if(documentid){
            data["DocumentId"] = documentid
        }
        
        setLoader(true)
        HTTPService('POST', url, data, false, true)
        .then((res) => {
            setLoader(false)
            setSuccessToastMessage("Bill uploaded successfully !!")
        }).catch ((e) => {
            if (e.response.status == 401){
                navigate("/login/sessionexpired")
                }
            setLoader(false)
            setErrorToastMessage ("Could not add the PPA. Error: " + e.response.status)
        });
        
    }

    const clearForm = () => {
        setBillMonth(null)
        setBillDate(null)
        setBillAmount(0)
        setDueDate(null)
        setUnitsGenerated(0)
        setBillRemarks("")
        setBillDocumentName("")
        setBase64String("")
        setPayAmount(0)
        setPayDate(null)
        setPayRemarks("")
        setOpenPaymentDialog(false)
        BillIdGolb = 0
        fileRef.current.value = null;
    }
    const deleteBill = (id) => {
        setErrorToastMessage (null)
        setSuccessToastMessage(null)
        BillIdGolb = id
        setConfirmDeleteDialogTitle("Delete Bill")
        setConfirmDeleteDialogContent("Are you sure you want to delete the Bill ? This action is not reversible..")
        setOpenDeleteDialog(true)
    }

    const handleConfirmDelete = () => {
        setErrorToastMessage (null)
        setSuccessToastMessage(null)
        setOpenDeleteDialog(false)
        let url = UrlConstants.base_url + UrlConstants.DeleteBill + "?billid=" + BillIdGolb
        setLoader(true)
        HTTPService('GET', url, '', false, true)
        .then((res) => {
            setLoader(false)
            setSuccessToastMessage("Bill deleted successfully !!")
            fetchBills(PPA.id)
        }).catch ((e) => {
            if (e.response.status == 401){
                navigate("/login/sessionexpired")
              }
            setLoader(false)
            setErrorToastMessage ("Could not delete the Bill. Error: " + e.response.status)
        });
    }
    
    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
          // Validate file type
          const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
          if (!validTypes.includes(file.type)) {
            alert('Only JPEG, PNG, and PDF files are allowed.');
            return;
          }
    
          setBillDocumentName(file.name);
    
          // Read file and convert to base64
          const reader = new FileReader();
          reader.onload = () => {
            setBase64String(reader.result);
          };
          reader.readAsDataURL(file);
        }
      };

    const fetchPPAList = () => {
        setErrorToastMessage (null)
        //setSuccessToastMessage(null)
        let url = UrlConstants.base_url + UrlConstants.PPA + "?ppaid=0"
        setLoader(true)
        HTTPService('GET', url, '', false, true)
        .then((res) => {
            setLoader(false)
            let data = res.data.dt.map((item, index) => {
                return {
                  index: index + 1,
                  id: item.ppaid,
                  label: item.generatorname + " - " + item.siteaddress + " - " + new Date(item.ppadate).toLocaleDateString('en-GB'),
                };
              });
            setPPAs(data)
        }).catch ((e) => {
            if (e.response.status == 401){
                navigate("/login/sessionexpired")
              }
            setLoader(false)
            setErrorToastMessage ("Could not fetch the details. Error: " + e.response.status)
        });
    }
    const fetchBills = (ppaid) => {
        if (!ppaid){
            alert("Please select PPA")
            return
        }
        setErrorToastMessage (null)
        //setSuccessToastMessage(null)
        let url = UrlConstants.base_url + UrlConstants.Bill + "?ppaid=" + ppaid
        setLoader(true)
        HTTPService('GET', url, '', false, true)
        .then((res) => {
            setLoader(false)
            let data = res.data.dt.map((item, index) => {
                return {
                  index: index + 1,
                  billid: item.billid,
                  month: item.month,
                  ppaid: item.ppaid,
                  billdate: item.billdate,
                  billamount: item.billamount,
                  unitsgeneratedinmu: item.unitsgeneratedinmu,
                  billfilename: item.billfilename,
                  billremarks: item.billremarks,
                  duedate: item.duedate,
                  paydate: item.paydate,
                  payamount: item.payamount,
                  payremarks: item.payremarks,
                };
              });
            data.sort((a, b) => new Date(b.month) - new Date(a.month)).forEach((item, index) => item.index = index + 1);
            setBills(data)
        }).catch ((e) => {
            if (e.response.status == 401){
                navigate("/login/sessionexpired")
              }
            setLoader(false)
            setErrorToastMessage ("Could not fetch the details. Error: " + e.response.status)
        });
    }

    useEffect(() => {
      if (!getTokenLocal()) 
            navigate ("/login")
            fetchPPAList()
    }, [])
    
    return (
    <>
        {errorToastMessage ? <ErrorToast message={errorToastMessage} 
                                         toastOpen={errorToastMessage ? true : false}
                                         closeToast={() => {setErrorToastMessage(null)}}/> : <></>}
        {successToastMessage ? <SuccessToast message={successToastMessage}
                                             toastOpen={successToastMessage ? true : false}
                                             closeToast={() => {setSuccessToastMessage(null)}}/>: <></>}
        {openDeleteDialog ? <ConfirmDialog title={confirmDeleteDialogTitle} content={confirmDeleteDialogContent} 
                        handleOk={handleConfirmDelete} 
                        handleClose={() => {setOpenDeleteDialog(false); return;}}/> : <></>}
        
        {openPaymentDialog ? <Dialog
                                open={true}
                                onClose={() => {clearForm(); setOpenPaymentDialog(false);}}
                                aria-labelledby="alert-dialog-title"
                                aria-describedby="alert-dialog-description"
                                width={'90%'}
                             >
                                <DialogTitle id="alert-dialog-title">
                                    {paymentDialogTitle}
                                </DialogTitle>
                                <DialogContent>
                                   <>
                                   <br />
                                   <Row>
                                        <Col xs={12} sm={12} md={6} lg={6}>
                                            <TextField 
                                                required
                                                value={payAmount}
                                                variant="outlined"
                                                onChange={(e) => setPayAmount(e.target.value)}
                                                type="number"
                                                label="Payment amount"
                                                className="textfield"
                                                helperText={"Payment amount in INR"}
                                            />
                                        </Col>
                                        <Col xs={12} sm={12} md={6} lg={6}>
                                        <   LocalizationProvider dateAdapter={AdapterDayjs}>
                                                <DatePicker
                                                    required
                                                    label="Payment date"
                                                    value={payDate}
                                                    onChange={(newValue) => {
                                                        setPayDate(newValue.format("YYYY-MM-DD"))
                                                    }}
                                                    inputFormat="DD/MM/YYYY"
                                                    renderInput={(params) => <TextField {...params} required/>}
                                                    className="textfield"
                                                />
                                            </LocalizationProvider>
                                        </Col>
                                    </Row>
                                    <br />
                                    <Row>
                                        <Col xs={12} sm={12} md={12} lg={12}>
                                            <TextField 
                                                required
                                                value={payRemarks}
                                                variant="outlined"
                                                onChange={(e) => setPayRemarks(e.target.value)}
                                                label="Payment remarks"
                                                className="textfield"
                                                helperText={"Payment remarks"}
                                                style={{width: '95%'}}
                                            />
                                        </Col>
                                    </Row>
                                   </>
                                </DialogContent>
                                <DialogActions>
                                    <Button onClick={() => {handlePaymentSubmit()}} variant="outlined" color="primary" autoFocus>Submit</Button>
                                    <Button onClick={() => {setOpenPaymentDialog(false); clearForm()}} variant="outlined" color="secondary">Close</Button>
                                </DialogActions>
                            </Dialog> 
                        : <></>}

        {loader ? <Loader /> : <></>}
        
        <Sidebar 
                content={(isLoggedInUserAdmin() || isLoggedInUserOfficeUser()) ? SideNavBar.admin_items : ((isLoggedInUserGenerator()) ? SideNavBar.siteuser_items : SideNavBar.billing_supervisor_items)} 
                background='rgba(21, 27, 88, 1.0)'
                hoverHighlight='rgba(100,100,100, 0.9)'
                activeHightlight='rgba(100,100,100, 0.9)'
                className='sidemenu'>
        <Header />
        <div className="main-container" ref={scrollToRef} id="main-container">
        
        <Card sx={{ width: '100%', fontFamily: 'Open Sans'}}>
            <CardHeader
                title="Load bills for a PPA"
                sx={{
                background: 'rgba(21, 27, 88, 0.3)',
                color: 'black',
                fontSize: 12,
                }}
            />
            <CardContent bsStyle="success">
                <br />
                <Row>
                    <Col xs={12} sm={12} md={12} lg={12}>
                        <Autocomplete
                            required
                            id="ppa"
                            options={PPAs}
                            value={PPA}
                            renderInput={(params) => <TextField {...params}  required label="Select PPA" helperText="Select the PPA" className="textfield"/>}
                            onChange={(e, value) => {setPPA(value); fetchBills(value.id)}}
                            sx={{width: '90%'}}
                        />
                    </Col>
                </Row>
            </CardContent>
        </Card>
            <br /><br />
            <Row>
                <Col xs={12} sm={12} md={4} lg={4}></Col>
                <Col xs={12} sm={12} md={4} lg={4}></Col>
                <Col xs={12} sm={12} md={4} lg={4}>
                    <Button 
                        required
                        type="submit"
                        variant="outlined"
                        color="primary"
                        onClick={() => {
                            let url = UrlConstants.GenericDownload + "?storedprocedure=Sp_GetAllPPA&additionalinfo1=NA&additionalinfo2=NA&additionalinfo3=NA&additionalinfo4=NA&additionalinfo5=NA&additionalinfo6=NA";
                            window.open(url, '_blank', 'noopener,noreferrer');
                        }}
                    > {"Export To Excel"}
                    </Button> &nbsp;&nbsp;
                 </Col>
            </Row>
            <br />
            <ToolkitProvider
                    keyField="id"
                    data={bills}
                    columns={columns}
                    pagination={ paginationFactory()}
                    search
                >
                    {(props) => (
                        <Row>
                        <Row>
                            <Col xl={8} md={12} sm={12} xs={12}>
                            {/* <SearchBar placeholder="Filter" srText="" { ...props.searchProps } /> */}
                            <MySearch {...props.searchProps} />
                            {/* <CloseButton onClick={ () => props.searchProps.onSearch('') }/> */}
                            </Col>
                        </Row>
                        <br />
                        {/* <hr /> */}
                        {/* <ExportCSVButton { ...props.csvProps }>Export CSV</ExportCSVButton> */}
                        {/* <hr /> */}
                        <BootstrapTable
                            className="table-container"
                            // rowEvents={rowEvents}
                            {...props.baseProps}
                            pagination={ paginationFactory()}
                            // pagination={ paginationFactory() }
                        />
                        </Row>
                    )}
                </ToolkitProvider>
            <br /><br />
            {isLoggedInUserGenerator() ?
            <>
            <Card sx={{ width: '100%', fontFamily: 'Open Sans'}}>
            <CardHeader
                title="Upload Bill"
                sx={{
                background: 'rgba(21, 27, 88, 0.3)',
                color: 'black',
                fontSize: 12,
                
                }}
            />
            <CardContent bsStyle="success">
                <form onSubmit={handleSubmit}>
                    <Row>
                        <Col xs={12} sm={12} md={6} lg={6}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    required
                                    label="Bill Month"
                                    value={BillMonth}
                                    onChange={(newValue) => {
                                        setBillMonth(new Date(new Date(newValue).setDate(1)).toISOString().split('T')[0])
                                    }}
                                    inputFormat="MM/YYYY"
                                    renderInput={(params) => <TextField {...params} required/>}
                                    className="textfield"
                                    views={['month', 'year']}
                                />
                            </LocalizationProvider>
                        </Col>
                        <Col xs={12} sm={12} md={6} lg={6}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    required
                                    label="Bill date"
                                    value={billDate}
                                    onChange={(newValue) => {
                                        setBillDate(newValue.format("YYYY-MM-DD"))
                                    }}
                                    inputFormat="DD/MM/YYYY"
                                    renderInput={(params) => <TextField {...params} required/>}
                                    className="textfield"
                                />
                            </LocalizationProvider>
                        </Col>
                    </Row>
                    <br />
                    <Row>
                        <Col xs={12} sm={12} md={6} lg={6}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DatePicker
                                    required
                                    label="Due date"
                                    value={dueDate}
                                    onChange={(newValue) => {
                                        setDueDate(newValue.format("YYYY-MM-DD"))
                                    }}
                                    inputFormat="DD/MM/YYYY"
                                    renderInput={(params) => <TextField {...params} required/>}
                                    className="textfield"
                                    minDate={new Date(new Date(billDate).setDate(new Date(billDate).getDate() + 1))}
                                />
                            </LocalizationProvider>
                        </Col>
                        <Col xs={12} sm={12} md={6} lg={6}>
                            <TextField 
                                required
                                value={BillAmount}
                                variant="outlined"
                                onChange={(e) => setBillAmount(e.target.value)}
                                type="number"
                                label="Bill amount"
                                className="textfield"
                                helperText={"Bill amount in INR"}
                            />
                        </Col>
                    </Row>
                    <br />
                    <Row>
                        <Col xs={12} sm={12} md={6} lg={6}>
                             <TextField 
                                required
                                value={unitsGenerated}
                                variant="outlined"
                                onChange={(e) => setUnitsGenerated(e.target.value)}
                                type="number"
                                label="Units generated"
                                className="textfield"
                                helperText={"Units generated (in MU)"}
                            />
                        </Col>
                        <Col xs={12} sm={12} md={6} lg={6}>
                            <TextField 
                                required
                                value={billRemarks}
                                variant="outlined"
                                onChange={(e) => setBillRemarks(e.target.value)}
                                label="Remarks"
                                className="textfield"
                                inputProps={{maxLength: 100}}
                                helperText={"Remarks (100 characters)"}
                            />
                        </Col>
                    </Row>
                    <br />
                    <Row>
                        <Col xs={12} sm={12} md={6} lg={6}>
                            <div> Upload Bill Document</div>
                            <input 
                                type="file" 
                                accept=".jpeg,.jpg,.png,.pdf" 
                                onChange={handleFileChange} 
                                className="textfield"
                                ref={fileRef}/>
                        </Col>
                        <Col xs={12} sm={12} md={6} lg={6}>
                            <Button 
                                required
                                type="submit"
                                variant="outlined"
                                color="primary"
                            > {"Add"}
                            </Button>
                            &nbsp;&nbsp;
                            <Button 
                                required
                                type="clear"
                                variant="outlined"
                                color="secondary"
                                onClick={() => {}}
                            > Clear
                            </Button>
                        </Col>
                    </Row>
                </form>
            </CardContent>
            </Card>
            <br /><br /></>:<></>}
        </div>
        </Sidebar>
    </>
    )
}

export default Bill;