import { StyleSheet, useColorScheme } from 'react-native';

const useStyles = () => {
  const theme = useColorScheme(); // 'light' or 'dark'

  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme === 'dark' ? '#121212' : 'white',
    },
    link: {
      marginTop: 15,
      paddingVertical: 15,
    },
    headerContainer: {
      alignItems: 'center',
      alignSelf: 'center',
      justifyContent: 'center',
      width: '100%',
      paddingTop: 50,
      paddingBottom: 20,
    },
  headerImage: {
    marginBottom: 10,
  },
  dateText: {
    marginTop: 10,
    fontSize: 20,
    marginBottom: 10,
    color: theme === 'dark' ? '#aaaaaa' : '#808080',
    fontWeight: 'bold',
  },
  habitItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    marginVertical: 8,
    backgroundColor: theme === 'dark' ? '#1E1E1E' : '#e0e0e0',
    borderRadius: 8,
    width: '90%',
    alignSelf: 'center',
  },
  editInput: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    padding: 8,
    width: 200,
  },
  picker: {
    width: '100%',
    marginTop: -70,
  },
  headerText: {
    color: theme === 'dark' ? '#ffffff' : '#000000',
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    width: '90%',
    alignSelf: 'center',
    paddingHorizontal: 16
  },
  columnHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme === 'dark' ? '#ffffff' : '#000000',
    width: '50%',
    textAlign: 'left',  
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme === 'dark' ? '#444' : '#ddd',
    borderRadius: 5,
    width: '90%',
    alignSelf: 'center',
  },
  habitName: {
    flex: 1,
    textAlign: 'left',
    color: theme === 'dark' ? '#000000' : '#000000',
  },
  completionRate: {
    flex: 1,
    textAlign: 'right',
    color: theme === 'dark' ? '#000000' : '#000000',
  },
  flatListContent: {
    paddingHorizontal: 30,
    paddingBottom: 16,
  },
  dateContainer: {
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    width: '90%',
    alignSelf: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme === 'dark' ? '#444' : '#ccc',
    padding: 8,
    borderRadius: 8,
    color: theme === 'dark' ? '#ffffff' : '#000000',
  },
  habitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    width: '90%',
    alignSelf: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    color: '#007AFF',
    fontSize: 18,
  },
  deleteButton: {
    color: 'red',
    fontSize: 18,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  buttonSpacing: {
    height: 10,
  },
  status: {
    fontSize: 18,
    color: '#4CAF50',
  },
  inputPlaceholder: {
    color: theme === 'dark' ? '#aaaaaa' : '#808080',
  },
});
};

export default useStyles;