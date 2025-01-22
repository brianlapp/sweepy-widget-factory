(function() {
  // Create QueryClient for data fetching
  const queryClient = new ReactQuery.QueryClient();

  // Export the full SweepstakesWidget component
  window.SweepstakesWidget = function(props) {
    const containerStyle = {
      fontFamily: 'system-ui, sans-serif',
      width: '100%',
      maxWidth: '24rem',
      margin: '0 auto'
    };

    return React.createElement(
      ReactQuery.QueryClientProvider,
      { client: queryClient },
      React.createElement(
        'div',
        { className: 'sweepstakes-widget', style: containerStyle },
        React.createElement(SweepstakesForm, {
          sweepstakesId: props.sweepstakesId,
          onSubmitSuccess: props.onSubmitSuccess
        })
      )
    );
  };

  // Create the SweepstakesForm component
  const SweepstakesForm = function({ sweepstakesId, onSubmitSuccess }) {
    const [isSubmitted, setIsSubmitted] = React.useState(false);
    const [formData, setFormData] = React.useState({
      first_name: '',
      last_name: '',
      email: '',
      terms_accepted: false
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const response = await fetch('https://xrycgmzgskcbhvdclflj.supabase.co/rest/v1/sweepstakes_entries', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyeWNnbXpnc2tjYmh2ZGNsZmxqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzczOTgzMDgsImV4cCI6MjA1Mjk3NDMwOH0.9_abIKE2UBX8AUB3R3VDLtYCR6MtrE6C1SAIAOy0CgA'
          },
          body: JSON.stringify({
            ...formData,
            sweepstakes_id: sweepstakesId
          })
        });

        if (!response.ok) {
          throw new Error('Failed to submit entry');
        }

        setIsSubmitted(true);
        if (onSubmitSuccess) {
          onSubmitSuccess();
        }
      } catch (error) {
        console.error('Error submitting entry:', error);
      }
    };

    const handleInputChange = (e) => {
      const { name, value, type, checked } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    };

    if (isSubmitted) {
      return React.createElement(
        'div',
        { className: 'text-center p-4' },
        React.createElement('h2', { className: 'text-xl font-bold mb-2' }, 'Thank you for entering!'),
        React.createElement('p', null, 'We\'ll contact you if you win.')
      );
    }

    return React.createElement(
      'form',
      { onSubmit: handleSubmit, className: 'space-y-4 p-4' },
      React.createElement(
        'div',
        { className: 'space-y-2' },
        React.createElement('label', { className: 'block text-sm font-medium' }, 'First Name'),
        React.createElement('input', {
          type: 'text',
          name: 'first_name',
          value: formData.first_name,
          onChange: handleInputChange,
          required: true,
          className: 'w-full p-2 border rounded'
        })
      ),
      React.createElement(
        'div',
        { className: 'space-y-2' },
        React.createElement('label', { className: 'block text-sm font-medium' }, 'Last Name'),
        React.createElement('input', {
          type: 'text',
          name: 'last_name',
          value: formData.last_name,
          onChange: handleInputChange,
          required: true,
          className: 'w-full p-2 border rounded'
        })
      ),
      React.createElement(
        'div',
        { className: 'space-y-2' },
        React.createElement('label', { className: 'block text-sm font-medium' }, 'Email'),
        React.createElement('input', {
          type: 'email',
          name: 'email',
          value: formData.email,
          onChange: handleInputChange,
          required: true,
          className: 'w-full p-2 border rounded'
        })
      ),
      React.createElement(
        'div',
        { className: 'flex items-center space-x-2' },
        React.createElement('input', {
          type: 'checkbox',
          name: 'terms_accepted',
          checked: formData.terms_accepted,
          onChange: handleInputChange,
          required: true,
          className: 'h-4 w-4'
        }),
        React.createElement('label', { className: 'text-sm' }, 'I accept the terms and conditions')
      ),
      React.createElement(
        'button',
        {
          type: 'submit',
          className: 'w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700'
        },
        'Enter Sweepstakes'
      )
    );
  };
})();