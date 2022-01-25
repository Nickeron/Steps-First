const options = ['Background Image', 'imageBackground'];

function mySettings(props) 
{
  return (
    <Page>
       <Section
          title="Show/Hide Background Image">
          <Toggle
          settingsKey='imageBackground'
          label='Background Image' />
        </Section>
    </Page>
  );
}

registerSettingsPage(mySettings);