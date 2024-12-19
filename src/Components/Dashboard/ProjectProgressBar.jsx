import * as React from 'react';
import PropTypes from 'prop-types';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

function LinearProgressWithLabel(props) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ width: '100%', mr: 1 }}>
        <LinearProgress variant="determinate" {...props} />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {`${Math.round(props.value)}%`}
        </Typography>
      </Box>
    </Box>
  );
}

LinearProgressWithLabel.propTypes = {
  /**
   * The value of the progress indicator for the determinate and buffer variants.
   * Value between 0 and 100.
   */
  value: PropTypes.number.isRequired,
};

export default function LinearWithValueLabel({from,to}) {
  const [progress, setProgress] = React.useState(10);
  const [pP, setPP] = React.useState(0);
  const projectProgress = ({from,to}) => {
  const startDate = new Date(from).getTime();
  const endDate = new Date(to).getTime();
  const currentDateTime = new Date().getTime();

  const progressPercentage = ((currentDateTime - startDate) / (endDate - startDate)) * 100;
  setPP(progressPercentage);
  console.log("progressPercentage",progressPercentage)
  };

  React.useEffect(() => {
    projectProgress({from,to});
  }, []);
  

  return (
    <Box sx={{ width: '70%' }} className="mx-auto">
      <LinearProgressWithLabel value={pP} sx={{
        height: 15,
        borderRadius: 5 // Adjust the height to make it thinner
      }} />
    </Box>
  );
}