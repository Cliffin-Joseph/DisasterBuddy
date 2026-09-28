import React, { useEffect, useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '../../components/UIComponents';
import { TASK_INVENTORY_CONFIG } from '../../data/checklistDefinitions';
import { getExpiryState, useDisasterBuddy } from '../../logic/appLogic';
import styles from '../../styles/styles';

const STEP_LABELS = ['Understand', 'Prepare', 'Check', 'Review'];

function createEmptyItemEntry(config) {
  return {
    id: null,
    category: config.categories[0].id,
    name: '',
    quantity: '',
    expiryDate: '',
  };
}

export default function TaskDetailScreen({ route, navigation }) {
  const { taskId } = route.params;
  const { getTaskById, updateTask, syncState } = useDisasterBuddy();
  const task = getTaskById(taskId);
  const config = TASK_INVENTORY_CONFIG[taskId];
  const carouselRef = useRef(null);
  const { width } = useWindowDimensions();
  const [step, setStep] = useState(0);
  const [items, setItems] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [editingCompleted, setEditingCompleted] = useState(false);
  const [entry, setEntry] = useState(() => createEmptyItemEntry(config));

  useEffect(() => {
    if (!task) {
      return;
    }

    setItems(task.items ?? []);
    const savedStep = task.completed ? 0 : (task.progressStep ?? 0);
    setStep(savedStep);

    if (task.knowledgePassed || task.completed) {
      setSelectedAnswer(task.knowledgeCheck.correctIndex);
      setAnswerSubmitted(true);
    }
  }, [taskId]);

  useEffect(() => {
    const completedSummaryIsVisible = task?.completed && !editingCompleted;
    if (!task || completedSummaryIsVisible) {
      return undefined;
    }

    const scrollTimer = setTimeout(() => {
      carouselRef.current?.scrollTo({
        x: step * width,
        animated: false,
      });
    }, 0);

    return () => clearTimeout(scrollTimer);
  }, [width, taskId, editingCompleted, step]);

  if (!task) {
    return null;
  }

  const selectedCategory = config.categories.find((category) => category.id === entry.category) ?? config.categories[0];
  const requiredCategories = config.categories.filter((category) => category.required);
  const missingCategories = requiredCategories.filter((category) => !items.some((item) => item.category === category.id));
  const totalQuantity = calculateTotalQuantity(items);
  const inventoryIsValid = validateInventory(items, config);
  const answerCorrect = answerSubmitted && selectedAnswer === task.knowledgeCheck.correctIndex;
  const taskIsReadyToComplete = inventoryIsValid && answerCorrect;

  const moveToStep = (nextStep) => {
    const lastStepIndex = STEP_LABELS.length - 1;
    const validStep = Math.max(0, Math.min(lastStepIndex, nextStep));

    setStep(validStep);
    carouselRef.current?.scrollTo({
      x: validStep * width,
      animated: true,
    });

    return validStep;
  };

  const goToStep = (nextStep) => {
    const validStep = moveToStep(nextStep);

    if (!task.completed) {
      const furthestVisitedStep = Math.max(task.progressStep ?? 0, validStep);
      const status = validStep > 0 ? 'in_progress' : task.status;

      updateTask(task.id, {
        progressStep: furthestVisitedStep,
        status,
      });
    }
  };

  const clearEntry = () => {
    setEntry(createEmptyItemEntry(config));
  };

  const persistItems = (nextItems) => {
    const nextTotalQuantity = calculateTotalQuantity(nextItems);
    const completedTaskIsStillValid = task.completed && validateInventory(nextItems, config);

    setItems(nextItems);
    updateTask(task.id, {
      items: nextItems,
      quantity: String(nextTotalQuantity),
      expiryDate: findEarliestExpiry(nextItems),
      progressStep: Math.max(1, task.progressStep ?? 0),
      status: completedTaskIsStillValid ? 'current_reviewed' : 'in_progress',
      completed: completedTaskIsStillValid,
    });
  };

  const saveEntry = () => {
    const numericQuantity = Number(entry.quantity);
    const itemNameIsMissing = !entry.name.trim();
    const quantityIsInvalid = !Number.isFinite(numericQuantity) || numericQuantity <= 0;

    if (itemNameIsMissing || quantityIsInvalid) {
      Alert.alert('Check this item', 'Enter a clear item name and a quantity greater than zero.');
      return;
    }

    const expiryDateHasCorrectFormat = /^\d{4}-\d{2}-\d{2}$/.test(entry.expiryDate);
    const expiryDateIsExpired = getExpiryState(entry.expiryDate) === 'expired';
    const requiredExpiryIsInvalid = selectedCategory.expiryRequired
      && (!expiryDateHasCorrectFormat || expiryDateIsExpired);

    if (requiredExpiryIsInvalid) {
      Alert.alert('Check the expiry date', 'Enter a current date in YYYY-MM-DD format.');
      return;
    }

    const savedEntry = {
      ...entry,
      id: entry.id ?? `${task.id}-${Date.now()}`,
      name: entry.name.trim(),
      quantity: String(numericQuantity),
      expiryDate: selectedCategory.expiryRequired ? entry.expiryDate : '',
    };

    const nextItems = entry.id
      ? items.map((item) => (item.id === entry.id ? savedEntry : item))
      : [...items, savedEntry];

    persistItems(nextItems);
    clearEntry();
  };

  const savePreparation = () => {
    const savedTaskDetails = {
      items,
      quantity: String(totalQuantity),
      expiryDate: findEarliestExpiry(items),
      progressStep: Math.max(1, task.progressStep ?? 0),
      status: task.completed ? 'current_reviewed' : 'in_progress',
      completed: task.completed,
    };
    updateTask(task.id, savedTaskDetails);

    if (!inventoryIsValid) {
      const missingCategoryNames = missingCategories
        .map((category) => category.label)
        .join(', ');
      const message = missingCategoryNames
        ? `Your recorded items were saved. Still needed: ${missingCategoryNames}.`
        : `Your recorded items were saved. Add at least ${config.minimumEntries} valid entries and meet the readiness target to continue.`;

      Alert.alert('Progress saved', message);
      return;
    }

    updateTask(task.id, {
      ...savedTaskDetails,
      progressStep: 2,
      status: task.completed ? 'current_reviewed' : 'details_added',
    });
    moveToStep(2);
  };

  const submitAnswer = () => {
    if (selectedAnswer !== null) {
      setAnswerSubmitted(true);
    }
  };

  const continueAfterAnswer = () => {
    if (!answerCorrect) {
      return;
    }

    updateTask(task.id, {
      knowledgePassed: true,
      progressStep: 3,
      status: task.completed ? 'current_reviewed' : 'knowledge_checked',
    });
    moveToStep(3);
  };

  const completeTask = () => {
    if (!taskIsReadyToComplete) {
      return;
    }

    updateTask(task.id, {
      items,
      quantity: String(totalQuantity),
      expiryDate: findEarliestExpiry(items),
      knowledgePassed: true,
      progressStep: 3,
      status: 'current_reviewed',
      completed: true,
      lastReviewedDate: new Date().toISOString(),
    });
    setEditingCompleted(false);
    Alert.alert(
      'Preparedness task completed',
      `${task.shortTitle} now contributes to Tier ${task.tier}.`,
      [{ text: 'Return to tier', onPress: () => navigation.goBack() }],
    );
  };

  if (task.completed && !editingCompleted) {
    return <CompletedTaskSummary task={task} config={config} syncState={syncState} navigation={navigation} onEdit={() => { setEditingCompleted(true); setStep(1); setTimeout(() => carouselRef.current?.scrollTo({ x: width, animated: false }), 0); }} />;
  }

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}>
      <KeyboardAvoidingView style={styles.carouselPage} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
        <View style={styles.carouselHeader}>
          <Pressable accessibilityRole="button" onPress={() => navigation.goBack()}><Text style={styles.back}>‹ Back</Text></Pressable>
          <Text style={styles.carouselEyebrow}>TIER {task.tier} · {step + 1} OF 4</Text><Text style={styles.carouselTitle}>{task.shortTitle}</Text>
          <View style={styles.stepDots}>{STEP_LABELS.map((label, index) => <View key={label} style={styles.stepDotItem}><View style={[styles.stepDot, index === step && styles.stepDotActive, index < step && styles.stepDotDone]} /><Text style={[styles.stepDotLabel, index === step && styles.stepDotLabelActive]}>{label}</Text></View>)}</View>
        </View>

        <ScrollView ref={carouselRef} horizontal pagingEnabled scrollEnabled={false} showsHorizontalScrollIndicator={false} style={{ width }}>
          <Slide width={width}><Text style={styles.slideKicker}>WHY THIS MATTERS</Text><Text style={styles.slideHeading}>{task.title}</Text><Text style={styles.body}>{task.whyItMatters}</Text><View style={styles.targetCard}><Text style={styles.targetLabel}>READINESS TARGET</Text><Text style={styles.targetText}>{task.target}</Text></View><View style={styles.viabilityNote}><Text style={styles.viabilityNoteTitle}>Make it household-ready</Text><Text style={styles.muted}>Everyone who may need this preparation should know where it is and how to use or access it safely.</Text></View><AppButton label="Start this task" onPress={() => goToStep(1)} /></Slide>

          <Slide width={width}><Text style={styles.slideKicker}>ITEMIZED PREPARATION</Text><Text style={styles.slideHeading}>Record every supporting item</Text><Text style={styles.body}>Add items individually so quantities and expiry dates remain accurate.</Text>
            <InventoryList items={items} config={config} onEdit={setEntry} onDelete={(id) => persistItems(items.filter((item) => item.id !== id))} />
            <View style={styles.entryEditor}><Text style={styles.cardTitle}>{entry.id ? 'Edit item' : `Add ${config.entryLabel.toLowerCase()}`}</Text><Text style={styles.label}>Item type</Text><View style={styles.categoryChips}>{config.categories.map((category) => <Pressable key={category.id} onPress={() => setEntry((current) => ({ ...current, category: category.id, expiryDate: category.expiryRequired ? current.expiryDate : '' }))} style={[styles.categoryChip, entry.category === category.id && styles.categoryChipSelected]}><Text style={[styles.categoryChipText, entry.category === category.id && styles.categoryChipTextSelected]}>{category.label}</Text></Pressable>)}</View><Text style={styles.label}>Item name or description</Text><TextInput value={entry.name} onChangeText={(name) => setEntry((current) => ({ ...current, name }))} placeholder="Be specific" style={styles.input} /><Text style={styles.label}>Quantity ({config.quantityUnit})</Text><TextInput value={entry.quantity} onChangeText={(quantity) => setEntry((current) => ({ ...current, quantity }))} keyboardType="decimal-pad" placeholder="0" style={styles.input} />{selectedCategory.expiryRequired && <><Text style={styles.label}>Expiry date</Text><TextInput value={entry.expiryDate} onChangeText={(expiryDate) => setEntry((current) => ({ ...current, expiryDate }))} placeholder="YYYY-MM-DD" style={styles.input} /></>}<View style={styles.entryActions}><AppButton label={entry.id ? 'Update item' : 'Add item'} onPress={saveEntry} />{entry.id && <AppButton label="Cancel edit" secondary onPress={clearEntry} />}</View></View>
            <RequirementSummary config={config} items={items} missingCategories={missingCategories} totalQuantity={totalQuantity} inventoryValid={inventoryIsValid} />
            <AppButton label="Save items and continue" onPress={savePreparation} />
          </Slide>

          <Slide width={width}><Text style={styles.slideKicker}>SITUATIONAL CHECK</Text><Text style={styles.slideHeading}>{task.knowledgeCheck.prompt}</Text>{task.knowledgeCheck.options.map((option, index) => { const selected = selectedAnswer === index; const correct = answerSubmitted && index === task.knowledgeCheck.correctIndex; const incorrect = answerSubmitted && selected && !correct; return <Pressable key={option} disabled={answerSubmitted} accessibilityRole="radio" accessibilityState={{ selected }} onPress={() => setSelectedAnswer(index)} style={[styles.quizOption, selected && styles.quizOptionSelected, correct && styles.quizOptionCorrect, incorrect && styles.quizOptionIncorrect]}><View style={styles.quizOptionMarker}><Text style={styles.quizOptionMarkerText}>{String.fromCharCode(65 + index)}</Text></View><Text style={styles.quizOptionText}>{option}</Text></Pressable>; })}{answerSubmitted && <View style={[styles.feedbackCard, answerCorrect ? styles.feedbackCorrect : styles.feedbackIncorrect]}><Text style={styles.feedbackTitle}>{answerCorrect ? 'Correct' : 'Not quite'}</Text><Text style={styles.feedbackText}>{task.knowledgeCheck.explanation}</Text></View>}{!answerSubmitted ? <AppButton label="Check answer" disabled={selectedAnswer == null} onPress={submitAnswer} /> : answerCorrect ? <AppButton label="Continue to review" onPress={continueAfterAnswer} /> : <AppButton label="Try again" secondary onPress={() => { setSelectedAnswer(null); setAnswerSubmitted(false); }} />}</Slide>

          <Slide width={width}><Text style={styles.slideKicker}>FINAL REVIEW</Text><Text style={styles.slideHeading}>Confirm this task is genuinely ready</Text><ReviewRow met={inventoryIsValid} label={`${items.length} supporting items recorded`} /><ReviewRow met={missingCategories.length === 0} label="All required item types accounted for" /><ReviewRow met={answerCorrect || task.knowledgePassed} label="Situational knowledge check passed" /><View style={styles.syncSummary}><Text style={styles.syncBannerLabel}>DATA STATUS</Text><Text style={styles.syncBannerText}>{syncState.message}</Text></View><Text style={styles.reviewDisclaimer}>Only mark complete when every recorded item is available, usable, accessible, and current.</Text><AppButton label="Mark task complete" disabled={!taskIsReadyToComplete} onPress={completeTask} /></Slide>
        </ScrollView>

        <View style={styles.carouselControls}><Pressable disabled={step === 0} onPress={() => goToStep(step - 1)}><Text style={[styles.carouselControlText, step === 0 && styles.carouselControlDisabled]}>Previous</Text></Pressable><Text style={styles.carouselControlCenter}>{STEP_LABELS[step]}</Text><Pressable disabled={step === 3} onPress={() => goToStep(step + 1)}><Text style={[styles.carouselControlText, step === 3 && styles.carouselControlDisabled]}>Next</Text></Pressable></View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function CompletedTaskSummary({ task, config, syncState, navigation, onEdit }) {
  return <SafeAreaView edges={['top', 'left', 'right']} style={styles.safeArea}><ScrollView contentContainerStyle={styles.page}><Pressable onPress={() => navigation.goBack()}><Text style={styles.back}>‹ Back to tier</Text></Pressable><Text style={styles.eyebrow}>COMPLETED · TIER {task.tier}</Text><Text style={styles.title}>{task.shortTitle}</Text><View style={styles.completedBanner}><Text style={styles.completedBannerIcon}>✓</Text><View style={{ flex: 1 }}><Text style={styles.completedBannerTitle}>Prepared and reviewed</Text><Text style={styles.muted}>{task.items.length} supporting items recorded</Text></View></View><InventoryList items={task.items} config={config} readOnly /><View style={styles.syncSummary}><Text style={styles.syncBannerLabel}>DATA STATUS</Text><Text style={styles.syncBannerText}>{syncState.message}</Text></View><AppButton label="Edit supporting items" onPress={onEdit} /></ScrollView></SafeAreaView>;
}

function InventoryList({ items, config, onEdit, onDelete, readOnly = false }) {
  if (items.length === 0) {
    return (
      <View style={styles.emptyInventory}>
        <Text style={styles.muted}>No supporting items recorded yet.</Text>
      </View>
    );
  }

  return (
    <View style={styles.inventoryList}>
      {items.map((item) => {
        const itemCategory = config.categories.find((category) => (
          category.id === item.category
        ));
        const expiryText = item.expiryDate ? ` · expires ${item.expiryDate}` : '';

        return (
          <View key={item.id} style={styles.inventoryItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.inventoryItemName}>{item.name}</Text>
              <Text style={styles.inventoryItemMeta}>
                {itemCategory?.label} · {item.quantity} {config.quantityUnit}{expiryText}
              </Text>
            </View>
            {!readOnly && (
              <View style={styles.inventoryItemActions}>
                <Pressable onPress={() => onEdit(item)}>
                  <Text style={styles.inventoryAction}>Edit</Text>
                </Pressable>
                <Pressable onPress={() => onDelete(item.id)}>
                  <Text style={styles.inventoryDelete}>Remove</Text>
                </Pressable>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

function RequirementSummary({ config, items, missingCategories, totalQuantity, inventoryValid }) {
  const title = inventoryValid ? 'Preparation target met' : 'Still needed';
  const missingCategoryNames = missingCategories
    .map((category) => category.label)
    .join(', ');

  return (
    <View style={[
      styles.requirementPanel,
      inventoryValid && styles.requirementPanelMet,
    ]}>
      <Text style={styles.requirementPanelTitle}>{title}</Text>
      <Text style={styles.requirementPanelText}>
        {items.length} of at least {config.minimumEntries} entries · total{' '}
        {totalQuantity} {config.quantityUnit}
      </Text>
      {config.minimumTotal ? (
        <Text style={styles.requirementPanelText}>
          Minimum total: {config.minimumTotal} {config.quantityUnit}
        </Text>
      ) : null}
      {missingCategories.length > 0 ? (
        <Text style={styles.requirementPanelText}>
          Required types: {missingCategoryNames}
        </Text>
      ) : null}
    </View>
  );
}

function Slide({ width, children }) {
  return (
    <ScrollView
      style={{ width, flexGrow: 0 }}
      contentContainerStyle={styles.slide}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      automaticallyAdjustKeyboardInsets
    >
      {children}
    </ScrollView>
  );
}

function ReviewRow({ met, label }) {
  return (
    <View style={[styles.reviewRow, met && styles.reviewRowMet]}>
      <Text style={styles.reviewRowIcon}>{met ? '✓' : '○'}</Text>
      <Text style={styles.reviewRowText}>{label}</Text>
    </View>
  );
}
function calculateTotalQuantity(items) {
  let totalQuantity = 0;

  items.forEach((item) => {
    totalQuantity += Number(item.quantity) || 0;
  });

  return totalQuantity;
}

function findEarliestExpiry(items) {
  const expiryDates = items
    .map((item) => item.expiryDate)
    .filter(Boolean)
    .sort();

  return expiryDates[0] ?? '';
}

function validateInventory(items, config) {
  const requiredCategories = config.categories.filter((category) => category.required);
  const allRequiredCategoriesArePresent = requiredCategories.every((category) => (
    items.some((item) => item.category === category.id)
  ));

  const hasMinimumNumberOfEntries = items.length >= config.minimumEntries;
  const everyEntryIsValid = items.every((item) => {
    const itemCategory = config.categories.find((category) => (
      category.id === item.category
    ));
    const numericQuantity = Number(item.quantity);
    const quantityIsValid = Number.isFinite(numericQuantity) && numericQuantity > 0;

    let expiryIsValid = true;
    if (itemCategory?.expiryRequired) {
      const expiryState = getExpiryState(item.expiryDate);
      expiryIsValid = Boolean(item.expiryDate)
        && expiryState !== 'none'
        && expiryState !== 'expired';
    }

    return Boolean(item.name.trim()) && quantityIsValid && expiryIsValid;
  });

  const totalQuantity = calculateTotalQuantity(items);
  const minimumTotalIsMet = !config.minimumTotal
    || totalQuantity >= config.minimumTotal;

  return hasMinimumNumberOfEntries
    && everyEntryIsValid
    && allRequiredCategoriesArePresent
    && minimumTotalIsMet;
}
