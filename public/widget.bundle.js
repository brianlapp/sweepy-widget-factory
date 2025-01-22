(function() {
  // Export the full SweepstakesWidget component
  window.SweepstakesWidget = function(props) {
    const containerStyle = {
      fontFamily: 'system-ui, sans-serif',
      width: '100%',
      maxWidth: '24rem',
      margin: '0 auto'
    };

    return React.createElement(
      'div',
      { className: 'sweepstakes-widget', style: containerStyle },
      React.createElement(window.SweepstakesForm, {
        sweepstakesId: props.sweepstakesId,
        onSubmitSuccess: props.onSubmitSuccess
      })
    );
  };
})();