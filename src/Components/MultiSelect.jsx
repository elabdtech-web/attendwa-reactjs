import * as React from 'react';
import Multiselect from 'multiselect-react-dropdown';
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import ListItemText from '@mui/material/ListItemText';
import Select from '@mui/material/Select';
import Chip from '@mui/material/Chip';
import Checkbox from '@mui/material/Checkbox';
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../Firebase/FirebaseConfig";
import { toast } from "react-toastify";


const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

function getStyles(fullName, personName, theme) {
  return {
    fontWeight: personName.includes(fullName)
      ? theme.typography.fontWeightMedium
      : theme.typography.fontWeightRegular,
  };
}
export default function MultipleSelectCheckmarks({onChange}) {
    const [personName, setPersonName] = React.useState([]);
  const [employees, setEmployees] = React.useState([]);

  const fetchActiveEmployees = async () => {
    try {
        const q = query(collection(db, "users"), where("status", "==", "active"));
        const querySnapshot = await getDocs(q);
        const activeEmployees = querySnapshot.docs.map((doc) =>({...doc.data(),id:doc.id}) );
        setEmployees(activeEmployees);
    } catch (error) {
        toast.error("Error fetching employees: ", error);
    }
  }

  React.useEffect(() => {
    fetchActiveEmployees();
  }, []);

  const handleChange = (event) => {
    const {
      target: { value },
    } = event;
    const selected = typeof value === 'string' ? value.split(',') : value;
    setPersonName(selected);
    onChange(selected);
  };

  return (
    <div>
      <FormControl sx={{ m: 1, width: 300 }} >
        <InputLabel id="demo-multiple-checkbox-label">Select Employee</InputLabel>
        <Select
          labelId="demo-multiple-checkbox-label"
          id="demo-multiple-checkbox"
          multiple
          value={personName}
          onChange={handleChange}
          input={<OutlinedInput label="Select Employee" />}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((value) => (
                <Chip key={value} label={value} />
              ))}
            </Box>
          )}
          MenuProps={MenuProps}
        >
          {employees.map((employee) => (
            <MenuItem key={employee.fullName} value={employee.regId}>
              <Checkbox checked={personName.includes(employee.regId)} />
              <ListItemText primary={employee.fullName} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}