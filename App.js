import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, TextInput, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', category: '' });
  const [editingTaskId, setEditingTaskId] = useState(null);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const storedTasks = await AsyncStorage.getItem('tasks');
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const saveTasks = async (tasksToSave) => {
    try {
      await AsyncStorage.setItem('tasks', JSON.stringify(tasksToSave));
      setTasks(tasksToSave);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddTask = () => {
    if (editingTaskId) {
      // Edit task
      const updatedTasks = tasks.map(task =>
        task.id === editingTaskId
          ? { ...task, ...newTask }
          : task
      );
      saveTasks(updatedTasks);
    } else {
      // Add new task
      const newTaskObj = { ...newTask, id: Date.now().toString(), completed: false };
      saveTasks([...tasks, newTaskObj]);
    }
    setModalVisible(false);
    setNewTask({ title: '', description: '', category: '' });
    setEditingTaskId(null);
  };

  const handleEditTask = (taskId) => {
    const taskToEdit = tasks.find(task => task.id === taskId);
    setNewTask({ title: taskToEdit.title, description: taskToEdit.description, category: taskToEdit.category });
    setEditingTaskId(taskId);
    setModalVisible(true);
  };

  const handleDeleteTask = (taskId) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    saveTasks(updatedTasks);
  };

  const toggleComplete = (taskId) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId
        ? { ...task, completed: !task.completed }
        : task
    );
    saveTasks(updatedTasks);
  };

  return (
    <View style={styles.container}>
      <Button title="Add Task" onPress={() => setModalVisible(true)} />
      <FlatList
        data={tasks}
        renderItem={({ item }) => (
          <View style={styles.taskItem}>
            <Text style={item.completed ? styles.completedTask : styles.taskTitle}>{item.title}</Text>
            <Text>{item.description}</Text>
            <Text>{item.category}</Text>
            <TouchableOpacity onPress={() => toggleComplete(item.id)}>
              <Text style={styles.button}>{item.completed ? 'Mark Incomplete' : 'Mark Complete'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleEditTask(item.id)}>
              <Text style={styles.button}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDeleteTask(item.id)}>
              <Text style={styles.button}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={item => item.id}
      />
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <TextInput
            style={styles.input}
            placeholder="Title"
            value={newTask.title}
            onChangeText={text => setNewTask({ ...newTask, title: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Description"
            value={newTask.description}
            onChangeText={text => setNewTask({ ...newTask, description: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Category"
            value={newTask.category}
            onChangeText={text => setNewTask({ ...newTask, category: text })}
          />
          <Button  style={styles.modalBtn} title={editingTaskId ? "Update Task" : "Add Task"} onPress={handleAddTask} />
          <Button style={styles.modalBtn} title="Cancel" onPress={() => setModalVisible(false)} />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent:"center",
    marginTop:30,
    backgroundColor: '#fff',
  },
  taskItem: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  taskTitle: {
    fontWeight: 'bold',
    fontSize:20,
  },
  completedTask: {
    fontWeight: 'bold',
    textDecorationLine: 'line-through',
    color: 'gray',
    fontSize:20,
  },
  button: {
    color: 'blue',
    marginVertical: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  input: {
    borderBottomWidth: 1,
    marginBottom: 10,
    padding: 8,
  },
  modalBtn:{
    marginBottom: 15,
    marginVertical:15,
    marginHorizontal:15,
  }
});

export default App;
