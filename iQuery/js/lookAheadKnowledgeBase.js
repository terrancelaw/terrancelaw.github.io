const LookAheadKnowledgeBase = {

	// the specification itself is useless
	// events should be ordered from most specific to least specific
	// each current event can only be matched to one event spec in each knowledge base item

	distributionComparison: {
		name: 'Distribution Comparison', active: true,
		specification: {
			x: 'quantitative',
			color: 'nominal',
			filter: { attribute: '=color', selected: 2 },
			showMe: 'density'
		},
		generateVisSpecMetadata: LAKBDistributionHandler.generateVisSpecMetadata,
		events: [
			{
				attributeCount: { quantitative: 1, nominal: 1 },
				handler: { 
					knowledgeBaseID: 'distributionComparison',
					eventModificationRules: [{ x: 'quantitative', color: 'nominal' }],
					template: {
						x: { type: 'quantitative', fixed: true, enumerated: false },
						color: { type: 'nominal', fixed: true, enumerated: false },
						filter: { attribute: '=color', selected: 2, fixed: false, enumerated: true },
						showMe: { type: 'density', fixed: true, enumerated: false }
					}
				}
			}, {
				attributeCount: { quantitative: 1 },
				handler: { 
					knowledgeBaseID: 'distributionComparison',
					eventModificationRules: [{ x: 'quantitative' }],
					template: {
						x: { type: 'quantitative', fixed: true, enumerated: false },
						color: { type: 'nominal', fixed: false, enumerated: true },
						filter: { attribute: '=color', selected: 2, fixed: false, enumerated: true },
						showMe: { type: 'density', fixed: true, enumerated: false }
					}
				}
			}, {
				attributeCount: { nominal: 1 }, 
				handler: { 
					knowledgeBaseID: 'distributionComparison',
					eventModificationRules: [{ color: 'nominal' }],
					template: {
						x: { type: 'quantitative', fixed: false, enumerated: true },
						color: { type: 'nominal', fixed: true, enumerated: false },
						filter: { attribute: '=color', selected: 2, fixed: false, enumerated: true },
						showMe: { type: 'density', fixed: true, enumerated: false }
					}
				}
			}
		]
	},
	slopeComparison: {
		name: 'Slope Comparison', active: true, 
		specification: {
			x: 'quantitative',
			y: 'quantitative',
			color: 'nominal',
			showme: 'trend'
		},
		generateVisSpecMetadata: LAKBSlopeHandler.generateVisSpecMetadata,
		events: [
			{
				attributeCount: { quantitative: 2 }, 
				handler: { 
					knowledgeBaseID: 'slopeComparison',
					eventModificationRules: [{ x: 'quantitative', y: 'quantitative' }],
					template: {
						x: { type: 'quantitative', fixed: true, enumerated: false },
						y: { type: 'quantitative', fixed: true, enumerated: false },
						color: { type: 'nominal', fixed: false, enumerated: true },
						showMe: { type: 'trend', fixed: true, enumerated: false }
					}
				}
			}, {
				attributeCount: { quantitative: 1 }, 
				handler: {
					knowledgeBaseID: 'slopeComparison',
					eventModificationRules: [
						{ x: 'quantitative' },
						{ y: 'quantitative' } // get the best one
					],
					template: {
						x: { type: 'quantitative', fixed: true, enumerated: true },
						y: { type: 'quantitative', fixed: true, enumerated: true },
						color: { type: 'nominal', fixed: false, enumerated: true },
						showMe: { type: 'trend', fixed: true, enumerated: false }
					}
				}
			}
		]
	},
	trendDetection: {
		name: 'Trend Detection', active: true,
		specification: {
			x: 'temporal',
			y: { type: 'quantitative', aggregate: 'mean' }
		},
		generateVisSpecMetadata: LAKBTrendHandler.generateVisSpecMetadata,
		events: [
			{ 
				attributeCount: { temporal: 1, quantitative: 1 }, 
				handler: {
					knowledgeBaseID: 'trendDetection',
					eventModificationRules: [{ x: 'temporal', y: { type: 'quantitative', aggregate: 'mean' } }],
					template: {
						x: { type: 'temporal', fixed: true, enumerated: false }, // time unit get from event
						y: { type: 'quantitative', aggregate: 'mean', fixed: true, enumerated: false }
					}
				}
			}, { 
				attributeCount: { temporal: 1 }, 
				handler: {
					knowledgeBaseID: 'trendDetection',
					eventModificationRules: [{ x: 'temporal' }],
					template: {
						x: { type: 'temporal', fixed: true, enumerated: false }, // time unit get from event
						y: { type: 'quantitative', aggregate: 'mean', fixed: false, enumerated: true }
					}
				}
			}, { 
				attributeCount: { quantitative: 1 }, 
				handler: {
					knowledgeBaseID: 'trendDetection',
					eventModificationRules: [{ y: { type: 'quantitative', aggregate: 'mean' } }],
					template: {
						x: { type: 'temporal', timeUnit: 'year', fixed: false, enumerated: true },
						y: { type: 'quantitative', aggregate: 'mean', fixed: true, enumerated: false }
					}
				}
			}
		]
	},
	correlation: {
		name: 'Correlation', active: true,
		specification: {
			x: 'quantitative',
			y: 'quantitative',
			showme: 'trend'
		},
		generateVisSpecMetadata: LAKBCorrelationHandler.generateVisSpecMetadata,
		events: [
			{
				attributeCount: { quantitative: 2 }, 
				handler: { 
					knowledgeBaseID: 'correlation',
					eventModificationRules: [{ x: 'quantitative', y: 'quantitative' }],
					template: {
						x: { type: 'quantitative', fixed: true, enumerated: true },
						y: { type: 'quantitative', fixed: true, enumerated: true },
						showMe: { type: 'trend', fixed: true, enumerated: false }
					}
				}
			}, {
				attributeCount: { quantitative: 1 }, 
				handler: { 
					knowledgeBaseID: 'correlation',
					eventModificationRules: [
						{ x: 'quantitative' },
						{ y: 'quantitative' } // get the best one
					],
					template: {
						x: { type: 'quantitative', fixed: true, enumerated: true },
						y: { type: 'quantitative', fixed: true, enumerated: true },
						showMe: { type: 'trend', fixed: true, enumerated: false }
					}
				}
			}
		]
	},

	// scagnostics

	outlying: {
		name: 'Outlying Scagnostic', active: false, 
		specification: {
			x: 'quantitative',
			y: 'quantitative'
		},
		generateVisSpecMetadata: function(visSpec) { return LAKBScagnosticsHandler.generateVisSpecMetadata(visSpec, 'outlying'); },
		events: [
			{
				attributeCount: { quantitative: 2 }, 
				handler: { 
					knowledgeBaseID: 'outlying',
					eventModificationRules: [{ x: 'quantitative', y: 'quantitative' }],
					template: {
						x: { type: 'quantitative', fixed: true, enumerated: true },
						y: { type: 'quantitative', fixed: true, enumerated: true }
					}
				}
			}, {
				attributeCount: { quantitative: 1 }, 
				handler: { 
					knowledgeBaseID: 'outlying',
					eventModificationRules: [
						{ x: 'quantitative' },
						{ y: 'quantitative' } // get the best one
					],
					template: {
						x: { type: 'quantitative', fixed: true, enumerated: true },
						y: { type: 'quantitative', fixed: true, enumerated: true }
					}
				}
			}
		]
	},
	skewed: {
		name: 'Skewed Scagnostic', active: false, 
		specification: {
			x: 'quantitative',
			y: 'quantitative'
		},
		generateVisSpecMetadata: function(visSpec) { return LAKBScagnosticsHandler.generateVisSpecMetadata(visSpec, 'skewed') },
		events: [
			{
				attributeCount: { quantitative: 2 }, 
				handler: { 
					knowledgeBaseID: 'skewed',
					eventModificationRules: [{ x: 'quantitative', y: 'quantitative' }],
					template: {
						x: { type: 'quantitative', fixed: true, enumerated: true },
						y: { type: 'quantitative', fixed: true, enumerated: true }
					}
				}
			}, {
				attributeCount: { quantitative: 1 }, 
				handler: { 
					knowledgeBaseID: 'skewed',
					eventModificationRules: [
						{ x: 'quantitative' },
						{ y: 'quantitative' } // get the best one
					],
					template: {
						x: { type: 'quantitative', fixed: true, enumerated: true },
						y: { type: 'quantitative', fixed: true, enumerated: true }
					}
				}
			}
		]
	},
	sparse: {
		name: 'Sparse Scagnostic', active: false, 
		specification: {
			x: 'quantitative',
			y: 'quantitative'
		},
		generateVisSpecMetadata: function(visSpec) { return LAKBScagnosticsHandler.generateVisSpecMetadata(visSpec, 'sparse') },
		events: [
			{
				attributeCount: { quantitative: 2 }, 
				handler: { 
					knowledgeBaseID: 'sparse',
					eventModificationRules: [{ x: 'quantitative', y: 'quantitative' }],
					template: {
						x: { type: 'quantitative', fixed: true, enumerated: true },
						y: { type: 'quantitative', fixed: true, enumerated: true }
					}
				}
			}, {
				attributeCount: { quantitative: 1 }, 
				handler: { 
					knowledgeBaseID: 'sparse',
					eventModificationRules: [
						{ x: 'quantitative' },
						{ y: 'quantitative' } // get the best one
					],
					template: {
						x: { type: 'quantitative', fixed: true, enumerated: true },
						y: { type: 'quantitative', fixed: true, enumerated: true }
					}
				}
			}
		]
	},
	clumpy: {
		name: 'Clumpy Scagnostic', active: false, 
		specification: {
			x: 'quantitative',
			y: 'quantitative'
		},
		generateVisSpecMetadata: function(visSpec) { return LAKBScagnosticsHandler.generateVisSpecMetadata(visSpec, 'clumpy') },
		events: [
			{
				attributeCount: { quantitative: 2 }, 
				handler: { 
					knowledgeBaseID: 'clumpy',
					eventModificationRules: [{ x: 'quantitative', y: 'quantitative' }],
					template: {
						x: { type: 'quantitative', fixed: true, enumerated: true },
						y: { type: 'quantitative', fixed: true, enumerated: true }
					}
				}
			}, {
				attributeCount: { quantitative: 1 }, 
				handler: { 
					knowledgeBaseID: 'clumpy',
					eventModificationRules: [
						{ x: 'quantitative' },
						{ y: 'quantitative' } // get the best one
					],
					template: {
						x: { type: 'quantitative', fixed: true, enumerated: true },
						y: { type: 'quantitative', fixed: true, enumerated: true }
					}
				}
			}
		]
	},
	striated: {
		name: 'Striated Scagnostic', active: false,
		specification: {
			x: 'quantitative',
			y: 'quantitative'
		},
		generateVisSpecMetadata: function(visSpec) { return LAKBScagnosticsHandler.generateVisSpecMetadata(visSpec, 'striated') },
		events: [
			{
				attributeCount: { quantitative: 2 }, 
				handler: { 
					knowledgeBaseID: 'striated',
					eventModificationRules: [{ x: 'quantitative', y: 'quantitative' }],
					template: {
						x: { type: 'quantitative', fixed: true, enumerated: true },
						y: { type: 'quantitative', fixed: true, enumerated: true }
					}
				}
			}, {
				attributeCount: { quantitative: 1 }, 
				handler: { 
					knowledgeBaseID: 'striated',
					eventModificationRules: [
						{ x: 'quantitative' },
						{ y: 'quantitative' } // get the best one
					],
					template: {
						x: { type: 'quantitative', fixed: true, enumerated: true },
						y: { type: 'quantitative', fixed: true, enumerated: true }
					}
				}
			}
		]
	},
	convex: {
		name: 'Convex Scagnostic', active: false,
		specification: {
			x: 'quantitative',
			y: 'quantitative'
		},
		generateVisSpecMetadata: function(visSpec) { return LAKBScagnosticsHandler.generateVisSpecMetadata(visSpec, 'convex') },
		events: [
			{
				attributeCount: { quantitative: 2 }, 
				handler: { 
					knowledgeBaseID: 'convex',
					eventModificationRules: [{ x: 'quantitative', y: 'quantitative' }],
					template: {
						x: { type: 'quantitative', fixed: true, enumerated: true },
						y: { type: 'quantitative', fixed: true, enumerated: true }
					}
				}
			}, {
				attributeCount: { quantitative: 1 }, 
				handler: { 
					knowledgeBaseID: 'convex',
					eventModificationRules: [
						{ x: 'quantitative' },
						{ y: 'quantitative' } // get the best one
					],
					template: {
						x: { type: 'quantitative', fixed: true, enumerated: true },
						y: { type: 'quantitative', fixed: true, enumerated: true }
					}
				}
			}
		]
	},
	skinny: {
		name: 'Skinny Scagnostic', active: false,
		specification: {
			x: 'quantitative',
			y: 'quantitative'
		},
		generateVisSpecMetadata: function(visSpec) { return LAKBScagnosticsHandler.generateVisSpecMetadata(visSpec, 'skinny') },
		events: [
			{
				attributeCount: { quantitative: 2 }, 
				handler: { 
					knowledgeBaseID: 'skinny',
					eventModificationRules: [{ x: 'quantitative', y: 'quantitative' }],
					template: {
						x: { type: 'quantitative', fixed: true, enumerated: true },
						y: { type: 'quantitative', fixed: true, enumerated: true }
					}
				}
			}, {
				attributeCount: { quantitative: 1 }, 
				handler: { 
					knowledgeBaseID: 'skinny',
					eventModificationRules: [
						{ x: 'quantitative' },
						{ y: 'quantitative' } // get the best one
					],
					template: {
						x: { type: 'quantitative', fixed: true, enumerated: true },
						y: { type: 'quantitative', fixed: true, enumerated: true }
					}
				}
			}
		]
	},
	stringy: {
		name: 'Stringy Scagnostic', active: false,
		specification: {
			x: 'quantitative',
			y: 'quantitative'
		},
		generateVisSpecMetadata: function(visSpec) { return LAKBScagnosticsHandler.generateVisSpecMetadata(visSpec, 'stringy') },
		events: [
			{
				attributeCount: { quantitative: 2 }, 
				handler: { 
					knowledgeBaseID: 'stringy',
					eventModificationRules: [{ x: 'quantitative', y: 'quantitative' }],
					template: {
						x: { type: 'quantitative', fixed: true, enumerated: true },
						y: { type: 'quantitative', fixed: true, enumerated: true }
					}
				}
			}, {
				attributeCount: { quantitative: 1 }, 
				handler: { 
					knowledgeBaseID: 'stringy',
					eventModificationRules: [
						{ x: 'quantitative' },
						{ y: 'quantitative' } // get the best one
					],
					template: {
						x: { type: 'quantitative', fixed: true, enumerated: true },
						y: { type: 'quantitative', fixed: true, enumerated: true }
					}
				}
			}
		]
	},
	monotonic: {
		name: 'Monotonic Scagnostic', active: false,
		specification: {
			x: 'quantitative',
			y: 'quantitative'
		},
		generateVisSpecMetadata: function(visSpec) { return LAKBScagnosticsHandler.generateVisSpecMetadata(visSpec, 'monotonic') },
		events: [
			{
				attributeCount: { quantitative: 2 }, 
				handler: { 
					knowledgeBaseID: 'monotonic',
					eventModificationRules: [{ x: 'quantitative', y: 'quantitative' }],
					template: {
						x: { type: 'quantitative', fixed: true, enumerated: true },
						y: { type: 'quantitative', fixed: true, enumerated: true }
					}
				}
			}, {
				attributeCount: { quantitative: 1 }, 
				handler: { 
					knowledgeBaseID: 'monotonic',
					eventModificationRules: [
						{ x: 'quantitative' },
						{ y: 'quantitative' } // get the best one
					],
					template: {
						x: { type: 'quantitative', fixed: true, enumerated: true },
						y: { type: 'quantitative', fixed: true, enumerated: true }
					}
				}
			}
		]
	}
}