import axios from "axios";
import { Col, Row, Table } from "react-bootstrap";
import {useEffect, useState, useRef} from 'react'
import Header from "../components/Header";
import HTTPService from "../constants/HTTPService";
import UrlConstants from "../constants/Urlconstants";
import { Sidebar, SidebarItem } from 'react-responsive-sidebar'
import SideNavBar from "../components/SideNavBar";
import { Autocomplete, Button, Card, CardContent, CardHeader, TextField } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
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
import { UploadFile } from "@mui/icons-material";

const { SearchBar, ClearSearchButton } = Search;

let PPAId = '';
let defaultObj = {id: 0, label: ''}
let usersGlobal = []

function PPA (){

    const [PPAs, setPPAs] = useState([])

    const [PPATypes, setPPATypes] = useState([{id:1, label: "Regular"}, {id:2, label: "Wheeling And Banking"}])
    const [generationTypes, setGenerationTypes] = useState([{id:1, label: "Hydal"}, {id:2, label: "Thermal"}, 
                                                            {id:3, label: "Gas"}, {id:4, label: "Diesel"}, 
                                                            {id:5, label: "Solar"}, {id:6, label: "Wind"}])

    const [sustainabilityTypes, setSustainabilityTypes] = useState([{id:1, label: "Renewable"}, {id:2, label: "Non-Renewable"}])

    const [users, setUsers] = useState([])

    const [PPAIdState, setPPAIdState] = useState("")
    const [PPAType, setPPAType] = useState(defaultObj)
    const [generatorName, setGeneratorName] = useState("")
    const [email, setEmail] = useState("")
    const [mobile, setMobile] = useState("")
    const [address, setAddress] = useState("")
    const [correspondenceAddress, setCorrespondenceAddress] = useState("")

    const[PPADate, setPPADate] = useState(null)
    const[commisioningDate, setCommisioningDate] = useState(null)
    const[ppaTermInYears, setPPATermInYears] = useState(0)

    const[generationType, setGenerationType] = useState(defaultObj)
    const[sustainability, setSustainability] = useState(defaultObj)
    const[capacityInMva, setCapacityInMva] = useState(0)
    const[user, setUser] = useState(defaultObj)

    const [PPADocumentName, setPPADocumentName] = useState('');
    const [base64String, setBase64String] = useState('');

    const [errorToastMessage, setErrorToastMessage] = useState(null)
    const [successToastMessage, setSuccessToastMessage] = useState(null)

    const [openDialog, setOpenDialog] = useState(false)
    const [confirmDialogTitle, setConfirmDialogTitle] = useState("")
    const [confirmDialogContent, setConfirmDialogContent] = useState("")
    const [loader, setLoader] = useState(false)

    const scrollToRef = useRef()
    const fileRef = useRef()

    const navigate = useNavigate()

    const columns = [{
        dataField: 'index',
        text: 'Sl No.'
      }, {
        dataField: 'ppatype',
        text: 'PPA Type',
        sort: true,
        headerClasses: 'text-center',
        classes: 'text-center'
      }, {
        dataField: 'generatorname',
        text: 'Generator name',
        sort: true,
        headerClasses: 'text-center',
        classes: 'text-center'
      },{
        dataField: 'mobile',
        text: 'Mobile',
        sort: true,
        headerClasses: 'text-center',
        classes: 'text-center'
      },{
        dataField: 'email',
        text: 'Email',
        sort: true,
        headerClasses: 'text-center',
        classes: 'text-center'
      },{
        dataField: 'siteaddress',
        text: 'Site Address',
        sort: true,
        headerClasses: 'text-center',
        classes: 'text-center'
      },{
        dataField: 'correspondanceaddress',
        text: 'Correspondence Address',
        sort: true,
        headerClasses: 'text-center',
        classes: 'text-center'
      },{
        dataField: 'ppadate',
        text: 'PPA Date',
        sort: true,
        formatter: (cell, row, rowIndex) => {
            return new Date(row.ppadate).toLocaleDateString('en-GB').split('/').join('-')
          },
        headerClasses: 'text-center',
        classes: 'text-center'
      },{
        dataField: 'commissioningdate',
        text: 'Commisioning Date',
        sort: true,
        formatter: (cell, row, rowIndex) => {
            return new Date(row.commissioningdate).toLocaleDateString('en-GB').split('/').join('-')
          },
          headerClasses: 'text-center',
          classes: 'text-center'
      },{
        dataField: 'ppaterminyears',
        text: 'PPA Term (in years)',
        sort: true,
        headerClasses: 'text-center',
        classes: 'text-center'
      },{
        dataField: 'generationtype',
        text: 'Generation type',
        sort: true,
        headerClasses: 'text-center',
        classes: 'text-center'
      },{
        dataField: 'renewableornonrenewable',
        text: 'Sustainability',
        sort: true,
        headerClasses: 'text-center',
        classes: 'text-center'
      },{
        dataField: 'capacityinmva',
        text: 'Capacity (mVA)',
        sort: true,
        headerClasses: 'text-center',
        classes: 'text-center'
      },{
        dataField: 'userid',
        text: 'Assignee',
        sort: true,
        formatter: (cell, row, rowIndex) => {
            let user = usersGlobal.filter(item => item && item.id === row.userid)[0]
            if (user)
                return user.label
            else
                return <></>
        },
        headerClasses: 'text-center',
        classes: 'text-center'
      },{
        dataField: 'ppadocumentname',
        text: 'Document',
        sort: true,
        formatter: (cell, row, rowIndex) => {
            return <><span style={{textDecoration: 'underline', cursor:'pointer'}} onClick={() => {downloadDocument(row.ppaid, row.ppadocumentname)}}>{row.ppadocumentname}</span></>
        },
        headerClasses: 'text-center',
        classes: 'text-center'
      },{
        dataField: 'action',
        text: 'Action',
        formatter: (cell, row, rowIndex) => {
            return <>
                        {isLoggedInUserAdmin() && <ModeEditIcon color="success" className="link"  onClick={() => {editPPA(row)}}></ModeEditIcon>}
                        {isLoggedInUserAdmin() && <DeleteIcon color="error" className="link" onClick={() => {deletePPA(row.PPAid)}}></DeleteIcon>}
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

    const handleSubmit = (event) => {
        event.preventDefault();
        if(event.nativeEvent.submitter.innerText.toLowerCase() === "add" || event.nativeEvent.submitter.innerText.toLowerCase() === "update"){
            setErrorToastMessage (null)
            setSuccessToastMessage(null)
            let url = UrlConstants.base_url + UrlConstants.PPA;
            let data = 
            {
                "PpaType": PPAType.label,
                "GeneratorName": generatorName,
                "Mobile": mobile,
                "Email": email,
                "SiteAddress": address,
                "CorrespondanceAddress": correspondenceAddress,
                "PpaDate": PPADate,
                "CommissioningDate": commisioningDate,
                "PpaTermInYears": ppaTermInYears,
                "GenerationType": generationType.label,
                "RenewableOrNonRenewable": sustainability.label,
                "CapacityInMva": capacityInMva,
                "PpaDocumentName": PPADocumentName,
                "OrgId": 1,
                "UserId": user.id
            }
            
            PPAIdState ? data['PPAid'] = PPAIdState : data['GeneratorName'] = generatorName.trim();
            
            setLoader(true)
            HTTPService('POST', url, data, false, true)
            .then((res) => {
                setLoader(false)
                PPAIdState ? setSuccessToastMessage("PPA updated successfully !!") : setSuccessToastMessage("PPA added successfully !!")
                if(base64String){
                    UploadFile(PPAIdState? PPAIdState : res.data.ppaid)
                }
                clearForm()
                fetchPPAList()
            }).catch ((e) => {
                if (e.response.status == 401){
                    navigate("/login/sessionexpired")
                  }
                setLoader(false)
                setErrorToastMessage ("Could not add the PPA. Error: " + e.response.status)
            });
        }
        else{
            clearForm()
        }
    }

    const getExistingDocument = async (ppaid) => {
        let url = UrlConstants.base_url + UrlConstants.Document + "?ppaid=" + ppaid + "&billid=-1";
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
    const downloadDocument = async (ppaid, fileName='downloaded_file') => {
        let response = await getExistingDocument(ppaid)
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

    const UploadFile = async (ppaid) => {
        setErrorToastMessage (null)
        setSuccessToastMessage(null)
        let response = await getExistingDocument(ppaid)
        let documentid = undefined
        if(response){
            documentid = response.documentid
        }
        let url = UrlConstants.base_url + UrlConstants.Document;
        let data = 
        {
            "ImageBase64String": base64String,
            "PpaId": ppaid,
            "BillId": -1,
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
            PPAIdState ? setSuccessToastMessage("PPA updated successfully !!") : setSuccessToastMessage("PPA added successfully !!")
        }).catch ((e) => {
            if (e.response.status == 401){
                navigate("/login/sessionexpired")
                }
            setLoader(false)
            setErrorToastMessage ("Could not add the PPA. Error: " + e.response.status)
        });
        
    }

    const fetchUsersList = () => {
        setErrorToastMessage (null)
        //setSuccessToastMessage(null)
        let url = UrlConstants.base_url + UrlConstants.get_all_users
        setLoader(true)
        HTTPService('GET', url, '', false, true)
        .then((res) => {
            setLoader(false)
            let data = res.data.dt1.map((item, index) => {
                if (item.role == LocalStorageConstants.ROLES.GENERATOR_USER){
                    return {
                        id: item.userid,
                        label: item.name
                    //   action: "Delete<br />Edit",
                    };
                }
              });
            usersGlobal = data.filter(item => item)
            setUsers(data.filter(item => item))
            fetchPPAList();
        }).catch ((e) => {
            if (e.response.status == 401){
                navigate("/login/sessionexpired")
              }
            setLoader(false)
            setErrorToastMessage ("Could not fetch the details. Error: " + e.response.status)
        });
    }

    const clearForm = () => {
        setPPAIdState("")
        setPPAType(defaultObj)
        setGeneratorName("")
        setEmail("")
        setMobile("")
        setAddress("")
        setCorrespondenceAddress("")
        setPPADate(null)
        setCommisioningDate(null)
        setPPATermInYears(0)
        setGenerationType(defaultObj)
        setSustainability(defaultObj)
        setCapacityInMva(0)
        setPPADocumentName("")
        setBase64String("")
        setUser(defaultObj)
        fileRef.current.value = null;
    }
    const deletePPA = (id) => {
        setErrorToastMessage (null)
        setSuccessToastMessage(null)
        PPAId = id
        setConfirmDialogTitle("Delete PPA")
        setConfirmDialogContent("Are you sure you want to delete the PPA ? This action is not reversible..")
        setOpenDialog(true)
    }

    const editPPA = (row) => {
        setPPAIdState(row.ppaid)
        setPPAType(PPATypes.filter(item => item.label === row.ppatype)[0])
        setGeneratorName(row.generatorname)
        setMobile(row.mobile)
        setEmail(row.email)
        setAddress(row.siteaddress)
        setCorrespondenceAddress(row.correspondanceaddress)
        setPPADate(row.ppadate)
        setCommisioningDate(row.commissioningdate)
        setPPATermInYears(row.ppaterminyears)
        setGenerationType(generationTypes.filter(item => item.label === row.generationtype)[0])
        setSustainability(sustainabilityTypes.filter(item => item.label === row.renewableornonrenewable)[0])
        setCapacityInMva(row.capacityinmva)
        setPPADocumentName(row.ppadocumentname)
        setUser(users.filter(item => item.id === row.userid)[0])

        document.getElementById('main-container').scrollTo({ top: 0, behavior: 'smooth'})
        scrollToRef.current.scrollIntoView()
    }

    const handleConfirmDelete = () => {
        setErrorToastMessage (null)
        setSuccessToastMessage(null)
        setOpenDialog(false)
        let url = UrlConstants.base_url + UrlConstants.DeletePpa + "?ppaid=" + PPAId
        setLoader(true)
        HTTPService('GET', url, '', false, true)
        .then((res) => {
            setLoader(false)
            setSuccessToastMessage("PPA deleted successfully !!")
            fetchPPAList()
        }).catch ((e) => {
            if (e.response.status == 401){
                navigate("/login/sessionexpired")
              }
            setLoader(false)
            setErrorToastMessage ("Could not delete the PPA. Error: " + e.response.status)
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
    
          setPPADocumentName(file.name);
    
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
                  ppaid: item.ppaid,
                  ppatype: item.ppatype,
                  generatorname: item.generatorname,
                  mobile: item.mobile,
                  email: item.email,
                  siteaddress: item.siteaddress,
                  correspondanceaddress: item.correspondanceaddress,
                  ppadate: item.ppadate,
                  commissioningdate: item.commissioningdate,
                  ppaterminyears: item.ppaterminyears,
                  generationtype: item.generationtype,
                  renewableornonrenewable: item.renewableornonrenewable,
                  capacityinmva: item.capacityinmva,
                  ppadocumentname: item.ppadocumentname,
                  orgid: item.orgid,
                  userid: item.userid,
                  createddate: item.createddate,
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

    useEffect(() => {
      if (!getTokenLocal()) 
            navigate ("/login")
      /*if ((isLoggedInUserAdmin() || isLoggedInUserOfficeUser()))
            navigate("/users")
      else if (isLoggedInUserSiteUser())
            navigate("/manpowerPPAcost")
      else if (isLoggedInUserBillingSupervisor())
            navigate("/customers")*/
      fetchUsersList();
    }, [])
    
    return (
    <>
        {errorToastMessage ? <ErrorToast message={errorToastMessage} 
                                         toastOpen={errorToastMessage ? true : false}
                                         closeToast={() => {setErrorToastMessage(null)}}/> : <></>}
        {successToastMessage ? <SuccessToast message={successToastMessage}
                                             toastOpen={successToastMessage ? true : false}
                                             closeToast={() => {setSuccessToastMessage(null)}}/>: <></>}
        {openDialog ? <ConfirmDialog title={confirmDialogTitle} content={confirmDialogContent} 
                        handleOk={handleConfirmDelete} 
                        handleClose={() => {setOpenDialog(false); return;}}/> : <></>}
        {loader ? <Loader /> : <></>}
        
        <Sidebar 
                content={(isLoggedInUserAdmin() || isLoggedInUserOfficeUser()) ? SideNavBar.admin_items : ((isLoggedInUserGenerator()) ? SideNavBar.siteuser_items : SideNavBar.billing_supervisor_items)} 
                background='rgba(21, 27, 88, 1.0)'
                hoverHighlight='rgba(100,100,100, 0.9)'
                activeHightlight='rgba(100,100,100, 0.9)'
                className='sidemenu'>
        <Header />
        <div className="main-container" ref={scrollToRef} id="main-container">
        {isLoggedInUserAdmin() ?
            <>
            <Card sx={{ width: '100%', fontFamily: 'Open Sans'}}>
            <CardHeader
                title="Add New PPA / Update an Existing PPA"
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
                            <Autocomplete
                                required
                                id="ppatype"
                                options={PPATypes}
                                value={PPAType}
                                renderInput={(params) => <TextField {...params}  required label="PPA Type" helperText="Select the PPA type" className="textfield"/>}
                                onChange={(e, value) => setPPAType(value)}
                                sx={{width: '90%'}}
                            />
                        </Col>
                        <Col xs={12} sm={12} md={6} lg={6}>
                            <TextField 
                                required
                                value={generatorName}
                                variant="outlined"
                                onChange={(e) => setGeneratorName(e.target.value)}
                                type="text"
                                label="Generator name"
                                className="textfield"
                                helperText={"Generator name"}
                            />
                        </Col>
                    </Row>
                    <br />
                    <Row>
                        <Col xs={12} sm={12} md={6} lg={6}>
                            <TextField 
                                required
                                value={mobile}
                                variant="outlined"
                                onChange={(e) => setMobile(e.target.value.trim())}
                                type="tel"
                                label="Generator Mobile Number"
                                className="textfield"
                                inputProps={{ maxLength: 10, pattern: '[0-9]{10}', inputMode: 'numeric' }}
                                helperText={"10 digit mobile number"}
                            />
                        </Col>
                        <Col xs={12} sm={12} md={6} lg={6}>
                            <TextField 
                                required
                                value={email}
                                variant="outlined"
                                onChange={(e) => setEmail(e.target.value)}
                                type="text"
                                label="Email"
                                className="textfield"
                                helperText={"Generator email"}
                            />
                        </Col>
                    </Row>
                    <br />
                    <Row>
                        <Col xs={12} sm={12} md={6} lg={6}>
                            <TextField 
                                required
                                value={address}
                                variant="outlined"
                                onChange={(e) => setAddress(e.target.value)}
                                type="text"
                                label="Address"
                                className="textfield"
                                helperText={"Generator site address"}
                            />
                        </Col>
                        <Col xs={12} sm={12} md={6} lg={6}>
                            <TextField 
                                required
                                value={correspondenceAddress}
                                variant="outlined"
                                onChange={(e) => setCorrespondenceAddress(e.target.value)}
                                type="text"
                                label="Correspondence Address"
                                className="textfield"
                                helperText={"Address for correspondence"}
                            />
                        </Col>
                    </Row>
                    <br />
                    <Row>
                        <Col xs={12} sm={12} md={6} lg={6}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                required
                                label="PPA Date"
                                value={PPADate}
                                onChange={(newValue) => {
                                    setPPADate(newValue.format("YYYY-MM-DD"))
                                }}
                                inputFormat="DD/MM/YYYY"
                                renderInput={(params) => <TextField {...params} required/>}
                                className="textfield"
                            />
                            </LocalizationProvider>
                        </Col>
                        <Col xs={12} sm={12} md={6} lg={6}>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                required
                                label="Commisioning date"
                                value={commisioningDate}
                                onChange={(newValue) => {
                                    setCommisioningDate(newValue.format("YYYY-MM-DD"))
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
                            <TextField 
                                required
                                value={ppaTermInYears}
                                variant="outlined"
                                onChange={(e) => setPPATermInYears(e.target.value.trim())}
                                type="number"
                                label="PPA Term in years"
                                className="textfield"
                                helperText={"PPA Term in years"}
                            />
                        </Col>
                        <Col xs={12} sm={12} md={6} lg={6}>
                            <Autocomplete
                                required
                                id="Generation type"
                                options={generationTypes}
                                value={generationType}
                                renderInput={(params) => <TextField {...params} required label="Generation type" helperText="Select the generator type" className="textfield"/>}
                                onChange={(e, value) => {setGenerationType(value); (value.id == 1 || value.id == 5 || value.id == 6) ? setSustainability(sustainabilityTypes[0]) : setSustainability(sustainabilityTypes[1]);}}
                                sx={{width: '90%'}}
                            />
                        </Col>
                    </Row>
                    <br />
                    <Row>
                        
                        <Col xs={12} sm={12} md={6} lg={6}>
                            <Autocomplete
                                required
                                id="Sustainability"
                                options={sustainabilityTypes}
                                value={sustainability}
                                renderInput={(params) => <TextField {...params} required label="Sustainability" helperText="Select the Sustainability" className="textfield"/>}
                                onChange={(e, value) => setSustainability(value)}
                                readOnly={true}
                                sx={{width: '90%'}}
                            />
                        </Col>
                        <Col xs={12} sm={12} md={6} lg={6}>
                            <TextField 
                                required
                                value={capacityInMva}
                                variant="outlined"
                                onChange={(e) => setCapacityInMva(e.target.value.trim())}
                                type="number"
                                label="Capacity in mVA"
                                className="textfield"
                                helperText={"Generation capacity in mVA"}
                            />
                        </Col>
                    </Row>
                    <br />
                    <Row>
                        <Col xs={12} sm={12} md={6} lg={6}>
                            <Autocomplete
                                required
                                id="user"
                                options={users}
                                value={user}
                                renderInput={(params) => <TextField {...params} required label="User" helperText="Select the user" className="textfield"/>}
                                onChange={(e, value) => setUser(value)}
                                sx={{width: '90%'}}
                            />
                        </Col>
                        <Col xs={12} sm={12} md={6} lg={6}>
                            <div> Upload PPA Document</div>
                            <input 
                                type="file" 
                                accept=".jpeg,.jpg,.png,.pdf" 
                                onChange={handleFileChange} 
                                className="textfield"
                                ref={fileRef}/>
                        </Col>
                    </Row>
                    <br />
                    <Row>
                        <Col xs={12} sm={12} md={12} lg={12}>
                            <Button 
                                required
                                type="submit"
                                variant="outlined"
                                color="primary"
                            > {PPAIdState ? "Update" : "Add"}
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
            {/*  
            <Table striped bordered hover >
                <thead>
                <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Mobile</th>
                    <th>Action</th>
                </tr>
                </thead>
                <tbody>
                    {users.map((user, index) => {
                        return(
                        <tr>
                        <td>{index + 1}</td>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.mobile}</td>
                        <td>
                            {/* <ModeEditIcon color="primary" onClick={editUser}/> 
                            <DeleteIcon color="warning" onClick={deleteUser(user.userid)}/>
                        </td>
                        </tr>)
                    })
                    }            
                </tbody>
            </Table>
            */}
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
                    data={PPAs}
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
        </div>
        </Sidebar>
    </>
    )
}

export default PPA;