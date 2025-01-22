
    (function() {
      window.SweepstakesWidget = function(props) {
        return React.createElement('div', {
          className: 'sweepstakes-widget',
          style: { fontFamily: 'system-ui, sans-serif' }
        }, [
          React.createElement('h2', { key: 'title' }, props.title || 'Enter to Win!'),
          React.createElement('p', { key: 'description' }, props.description || 'Complete the form below to enter.')
        ]);
      };
    })();
    